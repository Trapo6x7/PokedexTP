import React from "react";
import { View, ScrollView } from "react-native";
import { Row } from "../Row";
import { PokemonEvo } from "./PokemonEvo";
import { ThemedText } from "../ThemedText";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { PokemonEntry } from "@/hooks/useFetchQuery";
import { regionalEvolutions, type RegionName } from "@/functions/pokemon";

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
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

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
    const currentRegionName = currentPokemon.region as RegionName | null;
    // Use French name slug for comparison with regionalEvolutions
    // Remove region suffix (e.g., "miaouss de galar" -> "miaouss")
    let currentNameSlug = currentPokemon.nameSlug || normalizeName(currentPokemon.name.fr);
    
    // Clean up regional suffixes for matching with rules
    const regionalSuffixes = ["dalola", "de galar", "dhisui", "de paldea"];
    regionalSuffixes.forEach(suffix => {
      const normalizedSuffix = normalizeName(suffix);
      if (currentNameSlug.endsWith(normalizedSuffix)) {
        currentNameSlug = currentNameSlug.slice(0, -normalizedSuffix.length).trim();
      }
    });

    const filtered: EvolutionEntry[] = [];

    evolutions.forEach((evo) => {
      // Get normalized names for regional evolution matching
      const evoNameSlug = normalizeName(evo.name);
      
      // For TYPE 2: Check if current regional form has a different evolution
      if (currentIsRegional) {
        const specialEvo = regionalEvolutions.regionalToDifferent.find((re) => {
          const fromMatch = normalizeName(re.from) === currentNameSlug;
          const regionMatch = re.fromRegion === currentRegionName;
          const toMatch = normalizeName(re.to) === evoNameSlug;
          
          return fromMatch && regionMatch && toMatch;
        });
        
        if (specialEvo) {
          // This is the special evolution for this regional form - just add it directly
          filtered.push({
            pokedex_id: evo.pokedex_id,
            name: evo.name,
            condition: evo.condition,
            region: specialEvo.toRegion,
          });
          return;
        }
      }
      
      const evoVariants = entries.filter(
        (e) => e.pokedex_id === evo.pokedex_id
      );

      if (evoVariants.length === 0) {
        filtered.push(evo);
        return;
      }

      // Check for regional evolution rules
      // TYPE 1: Standard can evolve to regional form
      const standardToRegionalRule = regionalEvolutions.standardToRegional.find((re) => {
        const matchesNames = isPre
          ? normalizeName(re.to) === currentNameSlug &&
            normalizeName(re.from) === evoNameSlug
          : normalizeName(re.from) === currentNameSlug &&
            normalizeName(re.to) === evoNameSlug;
        return matchesNames && currentRegionName === null;
      });

      // TYPE 2: Regional form evolves to different Pokémon than standard
      const regionalToDifferentRule = regionalEvolutions.regionalToDifferent.find((re) => {
        const matchesNames = isPre
          ? normalizeName(re.to) === currentNameSlug &&
            normalizeName(re.from) === evoNameSlug
          : normalizeName(re.from) === currentNameSlug &&
            normalizeName(re.to) === evoNameSlug;
        const matchesRegion = isPre
          ? re.toRegion === currentRegionName
          : re.fromRegion === currentRegionName;
        return matchesNames && matchesRegion;
      });

      // TYPE 3: Only regional form can evolve (standard cannot)
      const regionalOnlyRule = regionalEvolutions.regionalOnlyEvolution.find((re) => {
        const matchesNames = isPre
          ? normalizeName(re.to) === currentNameSlug &&
            normalizeName(re.from) === evoNameSlug
          : normalizeName(re.from) === currentNameSlug &&
            normalizeName(re.to) === evoNameSlug;
        const matchesRegion = isPre
          ? re.toRegion === currentRegionName
          : re.fromRegion === currentRegionName;
        return matchesNames && matchesRegion;
      });

      // Check if this evolution is mentioned in any regional rule
      const hasAnyRegionalRule = 
        regionalEvolutions.regionalToDifferent.some((re) =>
          (normalizeName(re.from) === currentNameSlug || normalizeName(re.to) === currentNameSlug) ||
          (normalizeName(re.from) === evoNameSlug || normalizeName(re.to) === evoNameSlug)
        ) ||
        regionalEvolutions.regionalOnlyEvolution.some((re) =>
          (normalizeName(re.from) === currentNameSlug || normalizeName(re.to) === currentNameSlug) ||
          (normalizeName(re.from) === evoNameSlug || normalizeName(re.to) === evoNameSlug)
        );

      // Apply TYPE 1 rule: Standard Pokémon can evolve to regional form
      if (standardToRegionalRule) {
        // Show both standard AND regional evolution
        evoVariants.forEach((variant) => {
          filtered.push({
            pokedex_id: variant.pokedex_id,
            name: variant.name.fr,
            condition: evo.condition,
            region: variant.region,
          });
        });
        return;
      }

      // Apply TYPE 2 rule: Regional form evolves differently
      if (regionalToDifferentRule) {
        const targetRegion = isPre ? regionalToDifferentRule.fromRegion : regionalToDifferentRule.toRegion;
        const targetVariant = evoVariants.find((v) => v.region === targetRegion);
        
        if (targetVariant) {
          filtered.push({
            ...evo,
            name: targetVariant.name.fr,
            region: targetVariant.region,
            condition: evo.condition,
          });
        }
        return;
      }

      // Apply TYPE 3 rule: Only regional form can evolve
      if (regionalOnlyRule) {
        const targetRegion = isPre ? regionalOnlyRule.fromRegion : regionalOnlyRule.toRegion;
        const targetVariant = evoVariants.find((v) => v.region === targetRegion);
        
        if (targetVariant) {
          filtered.push({
            ...evo,
            name: targetVariant.name.fr,
            region: targetVariant.region,
            condition: evo.condition,
          });
        }
        return;
      }

      // If there's a regional rule but it doesn't match current region, skip this evolution
      if (hasAnyRegionalRule && currentIsRegional) {
        // This regional form has a special rule that doesn't apply here
        return;
      }

      // Default regional logic
      if (currentIsRegional) {
        // Pour un Pokémon régional, chercher uniquement la variante régionale
        const regionalMatch = evoVariants.find(
          (v) => v.region === currentRegionName
        );
        const standardMatch = evoVariants.find((v) => v.region === null);

        if (regionalMatch) {
          // Si une variante régionale existe, l'afficher uniquement
          filtered.push({
            ...evo,
            name: regionalMatch.name.fr,
            region: regionalMatch.region,
            condition: evo.condition,
          });
        } else if (standardMatch) {
          // Sinon, afficher la variante standard (fallback)
          filtered.push({
            ...evo,
            name: standardMatch.name.fr,
            region: null,
            condition: evo.condition,
          });
        }
      } else {
        // Pour un Pokémon standard : afficher uniquement la variante standard
        // Mais vérifier qu'il n'y a pas d'évolution exclusive à une forme régionale
        const isExclusiveToRegional = regionalEvolutions.regionalToDifferent.some((re) =>
          normalizeName(re.to) === evoNameSlug
        ) || regionalEvolutions.regionalOnlyEvolution.some((re) =>
          normalizeName(re.to) === evoNameSlug
        );

        if (isExclusiveToRegional) {
          // Cette évolution est exclusive à une forme régionale, ne pas l'afficher
          return;
        }

        const standardMatch = evoVariants.find((v) => v.region === null);
        
        if (standardMatch) {
          filtered.push({
            pokedex_id: standardMatch.pokedex_id,
            name: standardMatch.name.fr,
            condition: evo.condition,
            region: null,
          });
        } else {
          // Fallback
          const firstVariant = evoVariants[0];
          if (firstVariant) {
            filtered.push({
              pokedex_id: firstVariant.pokedex_id,
              name: firstVariant.name.fr,
              condition: evo.condition,
              region: firstVariant.region,
            });
          }
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
