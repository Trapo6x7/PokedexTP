import React from "react";
import { View, ScrollView } from "react-native";
import { Row } from "../Row";
import { PokemonEvo } from "./PokemonEvo";
import { ThemedText } from "../ThemedText";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { PokemonEntry } from "@/hooks/useFetchQuery";
import { specialEvolutions } from "@/functions/pokemon";

interface EvolutionEntry {
  pokedex_id: number;
  name: string;
  condition?: string;
  region?: string | null; // Add region to track which variant
}

// Match the exact structure from Tyradex API
interface DisplayedEvolution {
  pre: EvolutionEntry[] | null;
  next: EvolutionEntry[] | null;
  mega: any[] | null;
}

interface PokemonEvolutionsProps {
  chainPre: EvolutionEntry[];
  chainNext: EvolutionEntry[];
  chainStageNumber: number | null;
  displayedEvolution: DisplayedEvolution | null | undefined;
  colorType: string;
  currentPokedexId: number;
  currentRegion?: string | null;
  entries: PokemonEntry[];
  onNavigate: (pokedexId: number, region?: string | null) => void;
}

export function PokemonEvolutions({
  chainPre,
  chainNext,
  chainStageNumber,
  displayedEvolution,
  colorType,
  currentPokedexId,
  currentRegion,
  entries,
  onNavigate,
}: PokemonEvolutionsProps) {
  const colors = useThemeColors();

  // Helper: normalize name for comparison
  const normalizeName = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  const filterEvolutionsByRegion = (
    evolutions: EvolutionEntry[],
    isPre: boolean = false
  ): EvolutionEntry[] => {
    if (!Array.isArray(evolutions) || evolutions.length === 0) return [];

    const currentPokemon =
      entries.find(
        (e) => e.pokedex_id === currentPokedexId && e.region === currentRegion
      ) || entries.find((e) => e.pokedex_id === currentPokedexId);

    if (!currentPokemon) return evolutions;

    const currentIsRegional = currentPokemon.region !== null;
    const currentRegionName = currentPokemon.region;
    // Use French name slug for comparison with specialEvolutions
    const currentNameSlug = currentPokemon.nameSlug || normalizeName(currentPokemon.name.fr);

    const filtered: EvolutionEntry[] = [];

    evolutions.forEach((evo) => {
      const evoVariants = entries.filter((e) => e.pokedex_id === evo.pokedex_id);

      if (evoVariants.length === 0) {
        filtered.push(evo);
        return;
      }

      // Get normalized names for special evolution matching
      const evoEntry = entries.find((e) => e.pokedex_id === evo.pokedex_id);
      const evoNameSlug = evoEntry?.nameSlug || normalizeName(evoEntry?.name.fr || evo.name);
      
      console.log('Evolution check - evo.name:', evo.name, 'evoEntry?.name.fr:', evoEntry?.name.fr, 'evoNameSlug:', evoNameSlug);

      // Check for special evolution rules (for both pre and next evolutions)
      console.log('Checking special evo for:', currentNameSlug, isPre ? '<-' : '->', evoNameSlug, 'region:', currentRegionName);
      
      // For pre-evolutions, we need to reverse the direction (evo -> current instead of current -> evo)
      const specialEvo = specialEvolutions.find(
        (se) => {
          const matchesNames = isPre
            ? normalizeName(se.to) === currentNameSlug && normalizeName(se.from) === evoNameSlug
            : normalizeName(se.from) === currentNameSlug && normalizeName(se.to) === evoNameSlug;
          
          // For regional Pokemon, check if fromForm/toForm matches
          // For standard Pokemon, check if there's NO fromForm (for next evolutions) or NO toForm (for pre evolutions)
          const matchesForm = isPre
            ? ('toForm' in se && se.toForm ? se.toForm === currentRegionName : currentRegionName === null)
            : ('fromForm' in se ? se.fromForm === currentRegionName : currentRegionName === null);
          
          console.log('Testing rule:', se.from, '->', se.to, 
                     'fromForm:', 'fromForm' in se ? se.fromForm : 'none',
                     'toForm:', 'toForm' in se ? se.toForm : 'none',
                     'matchesNames:', matchesNames, 'matchesForm:', matchesForm);
          
          return matchesNames && matchesForm;
        }
      );

      if (specialEvo) {
        console.log('Found special evolution rule:', specialEvo);
        // For pre-evolutions, use fromForm; for next evolutions, use toForm
        const targetForm = isPre
          ? ('fromForm' in specialEvo && specialEvo.fromForm ? specialEvo.fromForm : null)
          : ('toForm' in specialEvo && specialEvo.toForm ? specialEvo.toForm : null);
        
        console.log('Target form:', targetForm, 'isPre:', isPre);
        const targetVariant = evoVariants.find((v) => v.region === targetForm);
        
        console.log('Target variant found:', targetVariant?.name.fr, 'region:', targetVariant?.region);
        
        if (targetVariant) {
          filtered.push({
            ...evo,
            name: targetVariant.name.fr,
            region: targetVariant.region,
          });
        }
        return; // Don't process further
      }

      // Default regional logic
      if (currentIsRegional) {
        // Pour un Pokémon régional, chercher uniquement la variante régionale
        const regionalMatch = evoVariants.find((v) => v.region === currentRegionName);
        const standardMatch = evoVariants.find((v) => v.region === null);

        if (isPre) {
          if (regionalMatch) {
            filtered.push({
              ...evo,
              name: regionalMatch.name.fr,
              region: regionalMatch.region,
            });
          } else if (standardMatch) {
            filtered.push({
              ...evo,
              name: standardMatch.name.fr,
              region: null,
            });
          }
        } else {
          if (regionalMatch) {
            filtered.push({
              ...evo,
              name: regionalMatch.name.fr,
              region: regionalMatch.region,
            });
          }

          // Cas spécial : afficher aussi la standard si elle existe (ex: Axoloto Paldea)
          if (regionalMatch && standardMatch) {
            filtered.push({
              ...evo,
              name: standardMatch.name.fr,
              region: null,
            });
          }
        }
      } else {
        // Pour un Pokémon STANDARD, vérifier s'il a des règles spéciales
        console.log('Standard Pokemon case - checking for special rules');
        console.log('currentNameSlug:', currentNameSlug, 'evoNameSlug:', evoNameSlug);
        
        const hasSpecialRule = specialEvolutions.some(
          (se) => {
            const matchesNames = normalizeName(se.from) === currentNameSlug &&
                                normalizeName(se.to) === evoNameSlug;
            const hasNoFromForm = !('fromForm' in se);
            
            console.log('Testing standard rule:', se.from, '->', se.to, 
                       'hasNoFromForm:', hasNoFromForm,
                       'matchesNames:', matchesNames);
            
            return matchesNames && hasNoFromForm;
          }
        );

        console.log('Has special rule:', hasSpecialRule);

        if (hasSpecialRule) {
          // Utiliser uniquement la variante standard définie dans les règles
          const standardMatch = evoVariants.find((v) => v.region === null);
          if (standardMatch) {
            filtered.push({
              ...evo,
              name: standardMatch.name.fr,
              region: null,
            });
          }
        } else {
          // Pas de règle spéciale : afficher TOUTES les variantes
          evoVariants.forEach((variant) => {
            const alreadyAdded = filtered.some(
              f => f.pokedex_id === variant.pokedex_id && f.region === variant.region
            );
            
            if (!alreadyAdded) {
              filtered.push({
                pokedex_id: variant.pokedex_id,
                name: variant.name.fr,
                condition: evo.condition,
                region: variant.region,
              });
            }
          });
        }
      }
    });

    return filtered;
  };


  // Determine which evolutions to display and filter by region
  let preRaw =
    chainPre && chainPre.length > 0 ? chainPre : displayedEvolution?.pre ?? [];
  const nextRaw =
    chainNext && chainNext.length > 0
      ? chainNext
      : displayedEvolution?.next ?? [];

  // Pour les stages 3, ne garder que la dernière pré-évolution (la directe)
  // displayedEvolution?.pre contient toute la chaîne [Pichu, Pikachu]
  // mais on veut seulement [Pikachu] pour Raichu
  if (chainStageNumber === 3 && Array.isArray(preRaw) && preRaw.length > 1) {
    preRaw = [preRaw[preRaw.length - 1]]; // Garder seulement le dernier (le plus proche)
  }

  const preFinal = filterEvolutionsByRegion(
    Array.isArray(preRaw) ? preRaw : [],
    true // isPre = true pour les pré-évolutions
  );
  const nextFinal = filterEvolutionsByRegion(
    Array.isArray(nextRaw) ? nextRaw : [],
    false // isPre = false pour les évolutions suivantes
  );

  const preCount = preFinal.length;
  const nextCount = nextFinal.length;

  // No evolutions at all
  if (preCount === 0 && nextCount === 0) {
    return (
      <ThemedText style={{ textAlign: "center", color: colors.grayMedium }}>
        Pas d'évolution
      </ThemedText>
    );
  }

  // Stage 2 with next evolutions: show pre on left, separator, next on right
  // Stage 2 without next evolutions (final form): behave like stage 3
  if (chainStageNumber === 2 && nextCount > 0) {
    return (
      <Row style={{ alignSelf: "stretch", gap: 8 }}>
        <View style={{ flex: 1, gap: 8 }}>
          {preCount > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 4,
                alignItems: "flex-end",
                ...(preCount === 1
                  ? { flexGrow: 1, justifyContent: "center" }
                  : {}),
              }}
            >
              <Row gap={8}>
                {preFinal.map((p) => (
                  <PokemonEvo
                    key={`pre-${p.pokedex_id}-${p.region || "standard"}`}
                    pokedex_id={p.pokedex_id}
                    name={p.name}
                    condition={p.condition}
                    region={p.region}
                    onPress={() => onNavigate(p.pokedex_id, p.region)}
                  />
                ))}
              </Row>
            </ScrollView>
          )}
        </View>

        <View
          style={{
            width: 1,
            marginHorizontal: 4,
            alignSelf: "center",
            height: 52,
          }}
        >
          <View
            style={{
              width: 1,
              height: 64,
              backgroundColor: colorType,
              borderRadius: 1,
              alignSelf: "center",
            }}
          />
        </View>

        <View style={{ flex: 1, gap: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 4,
              alignItems: "flex-start",
              ...(nextCount === 1
                ? { flexGrow: 1, justifyContent: "center" }
                : {}),
            }}
          >
            <Row gap={8}>
              {nextFinal.map((n) => (
                <PokemonEvo
                  key={`next-${n.pokedex_id}-${n.region || "standard"}`}
                  pokedex_id={n.pokedex_id}
                  name={n.name}
                  condition={n.condition}
                  region={n.region}
                  onPress={() => onNavigate(n.pokedex_id, n.region)}
                />
              ))}
            </Row>
          </ScrollView>
        </View>
      </Row>
    );
  }

  // Stage 1: show only next (stage 2)
  // Stage 2 without next (final): show only pre (stage 1)
  // Stage 3: show only pre (stage 2)
  const evolutionsToShow = chainStageNumber === 1 ? nextFinal : preFinal;

  return (
    <View style={{ alignSelf: "stretch" }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 4,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <Row gap={8}>
          {evolutionsToShow.map((evo) => (
            <PokemonEvo
              key={`evo-${evo.pokedex_id}-${evo.region || "standard"}`}
              pokedex_id={evo.pokedex_id}
              name={evo.name}
              condition={evo.condition}
              region={evo.region}
              onPress={() => onNavigate(evo.pokedex_id, evo.region)}
            />
          ))}
        </Row>
      </ScrollView>
    </View>
  );
}
