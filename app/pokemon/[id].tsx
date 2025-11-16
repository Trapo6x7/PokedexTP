import { Card } from "@/components/Card";
import { PokemonSpec } from "@/components/pokemon/PokemonSpec";
import { PokemonStat } from "@/components/pokemon/PokemonStat";
import { PokemonType } from "@/components/pokemon/PokemonType";
import { PokemonEvo } from "@/components/pokemon/PokemonEvo";
import { RootView } from "@/components/RootView";
import { Row } from "@/components/Row";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import {
  basePokemonStats,
  formatSize,
  formatWeight,
  getPokemonArtwork,
} from "@/functions/pokemon";
import { PokemonEntry, useFetchQuery } from "@/hooks/useFetchQuery";
import { useThemeColors } from "@/hooks/useThemeColors";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { useState } from "react";
import { PokemonEvolutions } from "@/components/pokemon/PokemonEvolutions";


export default function Pokemon() {
  const colors = useThemeColors();
  const params = useLocalSearchParams() as { id: string; region?: string | null; name?: string | null; pokedex?: string | null };
  const { data: pokemon } = useFetchQuery("/pokemon/[id]", { id: params.id });
  // If we have a region param and a name slug, fetch the regional form data
  const { data: regionalPokemon } = useFetchQuery(
    "/pokemon/[name]/[region]" as const,
    params.region && params.name ? { name: params.name, region: params.region } : undefined
  );
  const { data: allPokemons } = useFetchQuery("/pokemon");
  const id = parseInt(params.id, 10);
  const [currentForm, setCurrentForm] = useState<"regular" | "shiny" | "mega" | "gmax">("regular");
  const [megaIndex, setMegaIndex] = useState(0);
  
  // Get available forms
  const availableForms: Array<"regular" | "shiny" | "mega" | "gmax"> = ["regular"];
  if (pokemon?.sprites.shiny) {
    availableForms.push("shiny");
  }
  if (pokemon?.evolution?.mega && pokemon.evolution.mega.length > 0) {
    availableForms.push("mega");
  }
  if (pokemon?.sprites?.gmax) {
    availableForms.push("gmax");
  }
  
  // Check if Pokemon has only regular sprite (no other forms available)
  const hasOnlyRegularSprite = availableForms.length === 1;
  
  // Get current sprite URL based on form — handle regional forms via `params.region`
  const getCurrentSprite = (): string => {
    if (!pokemon) return "";

    const activeRegion = (params as any).region ?? null;
    if (activeRegion) {
      // look for a regional entry matching this id
      const regionalEntry = entries.find(
        (e) => e.pokedex_id === id && e.region === activeRegion
      );
      if (regionalEntry) {
        if (currentForm === "regular") return regionalEntry.sprites.regular;
        if (currentForm === "shiny" && regionalEntry.sprites.shiny)
          return regionalEntry.sprites.shiny;
        return regionalEntry.sprites.regular;
      }
    }

    // fallback to base pokemon sprites
    if (currentForm === "regular") {
      return pokemon.sprites.regular;
    } else if (currentForm === "shiny" && pokemon.sprites.shiny) {
      return pokemon.sprites.shiny;
    } else if (currentForm === "mega" && pokemon.evolution?.mega?.[megaIndex]) {
      return pokemon.evolution.mega[megaIndex].sprites.regular;
    } else if (currentForm === "gmax" && pokemon.sprites.gmax) {
      return pokemon.sprites.gmax.regular;
    }

    return pokemon.sprites.regular;
  };

  // Return a readable label for the current form for the small badge
  const getFormLabel = () => {
    if (currentForm === "regular") return "";
    if (currentForm === "shiny") return "Shiny";
    if (currentForm === "gmax") return "Gmax";
    if (currentForm === "mega") {
      const megaCount = pokemon?.evolution?.mega?.length ?? 0;
      const mega = pokemon?.evolution?.mega?.[megaIndex];
      // Prefer X/Y extracted from orbe (e.g., "Dracaufite X") when multiple megas
      if (megaCount > 1) {
        const orbe = mega?.orbe ?? "";
        const lastToken = orbe.split(" ").pop() ?? "";
        const suffix = /^(X|Y)$/i.test(lastToken) ? lastToken.toUpperCase() : null;
        if (suffix) return `Méga ${suffix}`;
        // fallback to labels
        const labels = ["X", "Y"];
        return `Méga ${labels[megaIndex] ?? megaIndex + 1}`;
      }
      return "Méga";
    }

    return "";
  };
  
  // Lightweight movement animation when switching forms: small translate + scale
  const formAnim = useSharedValue(0);
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -8 * formAnim.value },
      { scale: 1 + 0.1 * formAnim.value },
    ],
  }));

  const toggleForm = () => {
    const performSwitch = () => {
      // If we're on mega form and there are multiple mega evolutions, cycle through them
      if (currentForm === "mega" && pokemon?.evolution?.mega) {
        const megaCount = pokemon.evolution.mega.length;
        if (megaCount > 1 && megaIndex < megaCount - 1) {
          setMegaIndex(megaIndex + 1);
          return;
        }
        // If we're on the last mega form, reset index and move to next form type
        setMegaIndex(0);
      }

      const currentIndex = availableForms.indexOf(currentForm);
      const nextIndex = (currentIndex + 1) % availableForms.length;
      setCurrentForm(availableForms[nextIndex]);
    };

    // Spring to a slight peak (move up & scale), switch forms at the peak, then return
    // Use a short timing animation for minimal resource usage
    formAnim.value = withTiming(1, { duration: 120 }, (finished) => {
      if (finished) {
        runOnJS(performSwitch)();
        formAnim.value = withTiming(0, { duration: 140 });
      }
    });
  };
  
  // Prefer region-specific types if available (regional forms can change types)
  const displayedTypes = regionalPokemon?.types ?? pokemon?.types ?? [];
  const mainType = displayedTypes?.[0]?.name?.toLowerCase();
  const colorType = (mainType && Colors.type[mainType as keyof typeof Colors.type]) || colors.tint;
  const types = displayedTypes;
  const bio = regionalPokemon?.category ?? pokemon?.category;
  const displayedEvolution = regionalPokemon?.evolution ?? pokemon?.evolution;
  // If the region endpoint returned stats for the regional form use them, else fallback
  const displayedStats = regionalPokemon?.stats ?? pokemon?.stats;
  const stats = displayedStats
    ? [
        { stat: { name: "hp" }, base_stat: displayedStats.hp },
        { stat: { name: "atk" }, base_stat: displayedStats.atk },
        { stat: { name: "def" }, base_stat: displayedStats.def },
        { stat: { name: "spe-atk" }, base_stat: displayedStats.spe_atk },
        { stat: { name: "spe-def" }, base_stat: displayedStats.spe_def },
        { stat: { name: "vit" }, base_stat: displayedStats.vit },
      ]
    : basePokemonStats;

 // Build entries including regional forms like the main list (national = region === null)
  const pokemonWithForms = (allPokemons ?? []).filter((p) => p.formes && p.formes.length > 0);
  const regionalFormsQueries = pokemonWithForms
    .map((pokemon) => pokemon.formes!.map((forme) => ({ pokemon, forme })))
    .flat();

   const entries: PokemonEntry[] = (allPokemons ?? []).map((pokemon) => ({
    pokedex_id: pokemon.pokedex_id,
    generation: pokemon.generation,
    name: pokemon.name,
    sprites: pokemon.sprites,
    types: pokemon.types,
    formes: pokemon.formes,
    region: null as string | null,
    nameSlug: null as string | null,
  }));

  regionalFormsQueries.forEach(({ pokemon, forme }) => {
    entries.push({
      pokedex_id: pokemon.pokedex_id,
      generation: pokemon.generation,
      name: forme.name,
      sprites: {
        regular: `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokemon.pokedex_id}/regular_${forme.region}.png`,
        shiny: `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokemon.pokedex_id}/shiny_${forme.region}.png`,
        gmax: null,
      },
      types: pokemon.types,
      region: forme.region,
      nameSlug: pokemon.name.fr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
    });
  });

  const activeRegion = params.region ?? null;

  // Fetch PokeAPI evolution chain using pokeapi species -> evolution chain url
  const pokeChainQuery = useQuery({
    queryKey: ["pokeapi-evolution-chain", id],
    queryFn: async () => {
      if (!id) return null;
      const speciesResp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
      if (!speciesResp.ok) return null;
      const speciesJson: any = await speciesResp.json();
      const chainUrl: string | undefined = speciesJson?.evolution_chain?.url;
      if (!chainUrl) return null;
      const chainResp = await fetch(chainUrl);
      if (!chainResp.ok) return null;
      return chainResp.json();
    },
    enabled: !!id,
  });

  // Create entries for selected region; national if region === null
  const entriesForSelectedRegion = entries.filter((e) =>
    activeRegion === null ? e.region === null : e.region === activeRegion
  );

  // Find index by matching both pokedex_id and region
  const currentIndex = entriesForSelectedRegion.findIndex(
    (e) => e.pokedex_id === id && (activeRegion === null ? e.region === null : e.region === activeRegion)
  );

  const prevEntry = entriesForSelectedRegion[currentIndex - 1];
  const nextEntry = entriesForSelectedRegion[currentIndex + 1];

  const onPrevious = () =>
    router.setParams({ id: String(prevEntry?.pokedex_id ?? Math.max(id - 1, 1)), region: prevEntry?.region ?? undefined, name: prevEntry?.nameSlug ?? undefined });
  const onNext = () =>
    router.setParams({ id: String(nextEntry?.pokedex_id ?? Math.min(id + 1, entriesForSelectedRegion.length)), region: nextEntry?.region ?? undefined, name: nextEntry?.nameSlug ?? undefined });

  const isFirst = currentIndex <= 0;
  const isLast = currentIndex === -1 || currentIndex >= entriesForSelectedRegion.length - 1;

  // compute current stage and pre/next arrays from chainStages (if available)

  function formatChainCondition(details: any[] | null | undefined) {
    if (!details || details.length === 0) return "";
    const d = details[0];
    if (d.min_level) return `Niveau ${d.min_level}`;
    if (d.trigger?.name === "trade") return "Échange";
    if (d.item?.name) return `Objet: ${d.item.name}`;
    if (d.trigger?.name) return d.trigger.name;
    return "";
  }

  const chainStages = React.useMemo(() => {
    const chain = pokeChainQuery.data?.chain;
    if (!chain) return null;

    const stage1: any[] = [];
    const stage2: any[] = [];
    const stage3: any[] = [];

    // helper to extract pokedex id from PokeAPI species url
    const getSpeciesId = (url: string) => {
      const parts = url.split("/").filter(Boolean);
      return parseInt(parts[parts.length - 1], 10);
    };

    stage1.push({ species: chain.species, details: chain.evolution_details });
    chain.evolves_to.forEach((n: any) => {
      stage2.push({ species: n.species, details: n.evolution_details });
      (n.evolves_to || []).forEach((c: any) => {
        stage3.push({ species: c.species, details: c.evolution_details });
      });
    });

    const mapToEntries = (arr: any[]) =>
      arr
        .map((l) => {
          try {
            const pid = getSpeciesId(l.species.url);
            const entry = entries.find((e) => e.pokedex_id === pid);
            if (!entry) return null;
            return {
              pokedex_id: pid,
              name: entry.name?.fr ?? entry.name?.en ?? entry.name,
              condition: formatChainCondition(l.details),
            };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean) as any[];

    return {
      stage1: mapToEntries(stage1),
      stage2: mapToEntries(stage2),
      stage3: mapToEntries(stage3),
    };
  }, [pokeChainQuery.data, entries]);

    const chainStageNumber = React.useMemo(() => {
      if (!chainStages) return null;
      if (chainStages.stage1.some((s) => s.pokedex_id === id)) return 1;
      if (chainStages.stage2.some((s) => s.pokedex_id === id)) return 2;
      if (chainStages.stage3.some((s) => s.pokedex_id === id)) return 3;
      return null;
    }, [chainStages, id]);

  const chainPre = React.useMemo(() => {
    if (!chainStages || !chainStageNumber) return [] as any[];
    let rawPre: any[] = [];
    if (chainStageNumber === 2) rawPre = chainStages.stage1;
    if (chainStageNumber === 3) rawPre = chainStages.stage2;
    
    // Filter to match current Pokémon's regional status
    const currentPokemon = entries.find(
      (e) => e.pokedex_id === id && e.region === activeRegion
    ) || entries.find((e) => e.pokedex_id === id);
    
    if (!currentPokemon) return rawPre;
    
    // Filter: keep only pre-evolutions that match the current region
    const filtered = rawPre.filter((evo) => {
      const evoVariants = entries.filter((e) => e.pokedex_id === evo.pokedex_id);
      
      if (evoVariants.length === 0) return true;
      
      // If current is regional, only keep if pre-evolution has the same region
      if (currentPokemon.region !== null) {
        return evoVariants.some((v) => v.region === currentPokemon.region);
      } else {
        // If current is standard, only keep if pre-evolution has standard variant
        return evoVariants.some((v) => v.region === null);
      }
    });
    
    // Map to use correct regional names
    return filtered.map((evo) => {
      const evoVariants = entries.filter((e) => e.pokedex_id === evo.pokedex_id);
      
      if (currentPokemon.region !== null) {
        const regionalMatch = evoVariants.find((v) => v.region === currentPokemon.region);
        if (regionalMatch) {
          return {
            ...evo,
            name: regionalMatch.name.fr,
          };
        }
      }
      
      const standardMatch = evoVariants.find((v) => v.region === null);
      return {
        ...evo,
        name: standardMatch?.name.fr ?? evo.name,
      };
    });
  }, [chainStages, chainStageNumber, id, activeRegion, entries]);

  const chainNext = React.useMemo(() => {
    // Si on a des données PokeAPI chain, les utiliser
    if (chainStages && chainStageNumber) {
      let rawNext: any[] = [];
      if (chainStageNumber === 1) rawNext = chainStages.stage2;
      if (chainStageNumber === 2) rawNext = chainStages.stage3;
      
      const currentPokemon = entries.find(
        (e) => e.pokedex_id === id && e.region === activeRegion
      ) || entries.find((e) => e.pokedex_id === id);
      
      if (!currentPokemon) return rawNext;

      console.log('=== DEBUG chainNext ===');
      console.log('Current Pokemon:', currentPokemon.name.fr, 'Region:', currentPokemon.region);
      console.log('Raw evolutions from PokeAPI:', rawNext.map(e => `${e.name} (${e.pokedex_id})`));
      
      // Pour chaque évolution, vérifier si elle existe dans la bonne région
      const result = rawNext
        .map((evo) => {
          const evoVariants = entries.filter((e) => e.pokedex_id === evo.pokedex_id);
          
          console.log(`  Checking evolution ${evo.pokedex_id}, variants:`, 
            evoVariants.map(v => `${v.name.fr} (region: ${v.region || 'standard'})`));
          
          if (currentPokemon.region !== null) {
            // Pokémon régional : chercher la variante régionale correspondante
            const regionalMatch = evoVariants.find((v) => v.region === currentPokemon.region);
            if (regionalMatch) {
              console.log(`  ✓ Found regional match: ${regionalMatch.name.fr}`);
              return { ...evo, name: regionalMatch.name.fr };
            }
            console.log(`  ✗ No regional match for region ${currentPokemon.region}`);
            return null; // Exclure cette évolution
          } else {
            // Pokémon standard : chercher la variante standard uniquement
            const standardMatch = evoVariants.find((v) => v.region === null);
            if (standardMatch) {
              console.log(`  ✓ Found standard match: ${standardMatch.name.fr}`);
              return { ...evo, name: standardMatch.name.fr };
            }
            console.log(`  ✗ No standard variant found`);
            return null; // Exclure cette évolution
          }
        })
        .filter((e) => e !== null);
      
      console.log('Final filtered evolutions:', result.map(e => e?.name));
      return result;
    }
    
    // Fallback vers Tyradex
    return displayedEvolution?.next ?? [];
  }, [chainStages, chainStageNumber, id, activeRegion, entries, displayedEvolution]);


    // counts for centering single items
    const preCount = (chainPre && chainPre.length > 0 ? chainPre.length : (displayedEvolution?.pre?.length ?? 0));
    const nextCount = (chainNext && chainNext.length > 0 ? chainNext.length : (displayedEvolution?.next?.length ?? 0));

  return (
    <RootView bakcgroundColor={colorType}>
      <View>
        <Image
          style={[styles.pokeball, { width: 208, height: 208 }]}
          source={require("@/assets/images/Pokeball_big.png")}
        />
        <Row style={styles.header}>
          <Pressable onPress={router.back}>
            <Row gap={8}>
              <Image
                source={require("@/assets/images/arrow_back (1).png")}
                style={{ width: 32, height: 32 }}
              />
            </Row>
          </Pressable>
          <ThemedText color="grayWhite" variant="headline">
            {entriesForSelectedRegion[currentIndex]?.name?.fr ?? pokemon?.name.fr ?? ""}
          </ThemedText>
          <ThemedText color="grayWhite" variant="subtitle2">
            #{params.id.padStart(3, "0")}
          </ThemedText>
        </Row>

          <Card style={styles.card}>
                      <Row style={styles.imageRow}>
            {isFirst ? (
              <View style={{ width: 24, height: 24 }}></View>
            ) : (
              <Pressable onPress={onPrevious}>
                <Image
                  width={24}
                  height={24}
                  source={require("@/assets/images/chevron_left (1).png")}
                />
              </Pressable>
            )}
            <Pressable onPress={hasOnlyRegularSprite ? undefined : toggleForm} disabled={hasOnlyRegularSprite} style={styles.spriteContainer}>
              <Animated.View style={animStyle}>
                <Image
                source={{
                  uri: getCurrentSprite(),
                }}
                style={[{ width: 220, height: 220 }, styles.artwork]}
                />
              </Animated.View>
              {!hasOnlyRegularSprite && currentForm !== "regular" && (
                <View style={[styles.formBadge, { backgroundColor: colorType }]}>
                  <ThemedText color="grayWhite" variant="caption" style={styles.formText}>
                    {getFormLabel()}
                  </ThemedText>
                </View>
              )}
            </Pressable>
         {isLast ? (
              <View style={{ width: 24, height: 24 }}></View>
            ) : (
              <Pressable onPress={onNext}>
                <Image
                  width={24}
                  height={24}
                  source={require("@/assets/images/chevron_right (1).png")}
                />
              </Pressable>
            )}
          </Row>
            <Row gap={16} style={{ height: 20 , zIndex: 4}}>
              {types.map((type) => (
                <PokemonType name={type.name} key={type.name} />
              ))}
            </Row>
            <ThemedText variant="subtitle1" style={{ color: colorType }}>
              À propos
            </ThemedText>
            <Row>
              <PokemonSpec
                style={{
                  borderStyle: "solid",
                  borderRightWidth: 1,
                  borderColor: colors.grayLight,
                }}
                title={formatWeight(regionalPokemon?.weight ?? pokemon?.weight)}
                description="Poids"
                image={require("@/assets/images/weight.png")}
              />
              <PokemonSpec
                // style={{
                //   borderStyle: "solid",
                //   borderRightWidth: 1,
                //   borderColor: colors.grayLight,
                // }}
                title={formatSize(regionalPokemon?.height ?? pokemon?.height)}
                description="Taille"
                image={require("@/assets/images/straighten.png")}
              />
              {/* <PokemonSpec
                title={pokemon?.moves
                  .slice(0, 2)
                  .map((m) => m.move.name)
                  .join("\n")}
                description="Moves"
              /> */}
            </Row>

            {/* Stats*/}
            <Row style={{ alignItems: "center", gap: 8 }}>
              {/* Build a list of available items and render separators between them */}
              {(() => {
                // Prefer region-specific names when available
                const displayedName = regionalPokemon?.name ?? pokemon?.name;
                const parts = [displayedName?.en, displayedName?.jp, bio].filter(Boolean);
                return (
                  <Row gap={6} style={{ alignItems: "center" }}>
                    {parts.map((part, i) => (
                      <Row key={`part-${i}`} gap={6} style={{ alignItems: "center" }}>
                        <ThemedText color="grayMedium" variant="subtitle3">{part}</ThemedText>
                        {i < parts.length - 1 && (
                          <ThemedText color="grayMedium" variant="subtitle3" style={{ opacity: 0.6 }}>•</ThemedText>
                        )}
                      </Row>
                    ))}
                  </Row>
                );
              })()}
            </Row>
            <ThemedText variant="subtitle1" style={{ color: colorType }}>
              Statistiques de base
            </ThemedText>
          <View style={{ alignSelf: "stretch" }}>
            {stats.map((stat) => (
              <PokemonStat
                key={stat.stat.name}
                name={stat.stat.name}
                value={stat.base_stat}
                color={colorType}
              />
            ))}
          </View>
          
 <ThemedText variant="subtitle1" style={{ color: colorType }}>
            Évolutions
          </ThemedText>
         <PokemonEvolutions
            chainPre={chainPre}
            chainNext={chainNext}
            chainStageNumber={chainStageNumber}
            displayedEvolution={displayedEvolution}
            colorType={colorType}
            currentPokedexId={pokemon?.pokedex_id ?? 0}
            currentRegion={activeRegion}
            entries={entries}
            onNavigate={(targetId) => {
              const targetName = entries.find((e) => e.pokedex_id === targetId && e.region === activeRegion)?.nameSlug 
                ?? entries.find((e) => e.pokedex_id === targetId)?.nameSlug;
              router.setParams({ 
                id: String(targetId), 
                region: activeRegion ?? undefined, 
                name: targetName ?? undefined 
              });
            }}
          />
        </Card>
      </View>
    </RootView>
  );
}

const styles = StyleSheet.create({
  header: { margin: 20, justifyContent: "space-between" },
  pokeball: { opacity: 0.1, position: "absolute", right: 8, top: 8 },
  artwork: { alignSelf: "center" , top: -20},
  spriteContainer: {
    position: "relative",
    borderRadius: 110,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  formBadge: {
    position: "absolute",
    top: -6,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    opacity: 1,
  },
  formText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  body: {  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    gap: 8,
    alignItems: "center",
    marginTop: 144
  },
  imageRow: {
    position: "absolute",
    top: -140,
    zIndex: 2,
    justifyContent: "space-between",
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
});
