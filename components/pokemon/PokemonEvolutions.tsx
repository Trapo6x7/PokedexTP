import React from "react";
import { View, ScrollView } from "react-native";
import { Row } from "../Row";
import { PokemonEvo } from "./PokemonEvo";
import { ThemedText } from "../ThemedText";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { PokemonEntry } from "@/hooks/useFetchQuery";

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
  onNavigate: (pokedexId: number) => void;
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

  // Helper function to filter evolutions by region compatibility
  const filterEvolutionsByRegion = (
    evolutions: EvolutionEntry[]
  ): EvolutionEntry[] => {
    if (!Array.isArray(evolutions) || evolutions.length === 0) return [];

    const currentPokemon =
      entries.find(
        (e) => e.pokedex_id === currentPokedexId && e.region === currentRegion
      ) || entries.find((e) => e.pokedex_id === currentPokedexId);

    if (!currentPokemon) return evolutions;

    const currentIsRegional = currentPokemon.region !== null;
    const currentRegionName = currentPokemon.region;

    const filtered: EvolutionEntry[] = [];

    evolutions.forEach((evo) => {
      const evoVariants = entries.filter(
        (e) => e.pokedex_id === evo.pokedex_id
      );

      if (evoVariants.length === 0) {
        filtered.push(evo);
        return;
      }

      if (currentIsRegional) {
        const regionalMatch = evoVariants.find(
          (v) => v.region === currentRegionName
        );

        if (regionalMatch) {
          filtered.push({
            ...evo,
            name: regionalMatch.name.fr,
            region: regionalMatch.region, // Pass the region
          });
        } else {
          const standardMatch = evoVariants.find((v) => v.region === null);
          if (standardMatch) {
            filtered.push({
              ...evo,
              name: standardMatch.name.fr,
              region: null, // Explicitly null for standard
            });
          }
        }
      } else {
        const standardMatch = evoVariants.find((v) => v.region === null);

        if (standardMatch) {
          filtered.push({
            ...evo,
            name: standardMatch.name.fr,
            region: null, // Explicitly null for standard
          });
        }
      }
    });

    return filtered;
  };

  // Determine which evolutions to display and filter by region
  const preRaw =
    chainPre && chainPre.length > 0 ? chainPre : displayedEvolution?.pre ?? [];
  const nextRaw =
    chainNext && chainNext.length > 0
      ? chainNext
      : displayedEvolution?.next ?? [];

  const preFinal = filterEvolutionsByRegion(
    Array.isArray(preRaw) ? preRaw : []
  );
  const nextFinal = filterEvolutionsByRegion(
    Array.isArray(nextRaw) ? nextRaw : []
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
                ...(preCount === 1 ? { flexGrow: 1, justifyContent: "center" } : {}),
              }}
            >
              <Row gap={8}>
                {preFinal.map((p) => (
                  <PokemonEvo
                    key={`pre-${p.pokedex_id}-${p.region || 'standard'}`}
                    pokedex_id={p.pokedex_id}
                    name={p.name}
                    condition={p.condition}
                    region={p.region} // Pass region
                    onPress={() => onNavigate(p.pokedex_id)}
                  />
                ))}
              </Row>
            </ScrollView>
          )}
        </View>

        <View style={{ width: 1, marginHorizontal: 4, alignSelf: "center", height: 52 }}>
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
              ...(nextCount === 1 ? { flexGrow: 1, justifyContent: "center" } : {}),
            }}
          >
            <Row gap={8}>
              {nextFinal.map((n) => (
                <PokemonEvo
                  key={`next-${n.pokedex_id}-${n.region || 'standard'}`}
                  pokedex_id={n.pokedex_id}
                  name={n.name}
                  condition={n.condition}
                  region={n.region} // Pass region
                  onPress={() => onNavigate(n.pokedex_id)}
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
              key={`evo-${evo.pokedex_id}-${evo.region || 'standard'}`}
              pokedex_id={evo.pokedex_id}
              name={evo.name}
              condition={evo.condition}
              region={evo.region} // Pass region
              onPress={() => onNavigate(evo.pokedex_id)}
            />
          ))}
        </Row>
      </ScrollView>
    </View>
  );
}
