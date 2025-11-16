import { Card } from "@/components/Card";
import { PokemonSpec } from "@/components/pokemon/PokemonSpec";
import { PokemonStat } from "@/components/pokemon/PokemonStat";
import { PokemonType } from "@/components/pokemon/PokemonType";
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
import { useFetchQuery } from "@/hooks/useFetchQuery";
import { useThemeColors } from "@/hooks/useThemeColors";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { useState } from "react";

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

  const entries = (allPokemons ?? []).map((pokemon) => ({
    pokedex_id: pokemon.pokedex_id,
    name: pokemon.name,
    sprites: pokemon.sprites,
    types: pokemon.types,
    region: null as string | null,
    nameSlug: null as string | null,
  }));

  regionalFormsQueries.forEach(({ pokemon, forme }) => {
    entries.push({
      pokedex_id: pokemon.pokedex_id,
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
          {!pokemon?.evolution?.pre && !pokemon?.evolution?.next ? (
            <ThemedText style={{ textAlign: "center", color: colors.grayMedium }}>
              Pas d'évolution
            </ThemedText>
          ) : (
            <Row style={{ alignSelf: "stretch", gap: 8 }}>
              {/* Pré-évolution directe à gauche (dernière de la liste) */}
              <View style={{ flex: 1, gap: 8 }}>
                {displayedEvolution?.pre && displayedEvolution.pre.length > 0 && (
                  <Pressable
                    onPress={() => {
                      const targetId = displayedEvolution.pre![displayedEvolution.pre!.length - 1].pokedex_id;
                      const targetName = entries.find((e) => e.pokedex_id === targetId && e.region === activeRegion)?.nameSlug ?? entries.find((e) => e.pokedex_id === targetId)?.nameSlug;
                      router.setParams({ id: String(targetId), region: activeRegion ?? undefined, name: targetName ?? undefined });
                    }}
                    style={{ backgroundColor: colors.grayWhite, padding: 12, borderRadius: 8, alignItems: "center" }}
                  >
                    <ThemedText variant="subtitle3">
                      ← {displayedEvolution.pre[displayedEvolution.pre.length - 1].name}
                    </ThemedText>
                    <ThemedText variant="caption" color="grayMedium">
                      {displayedEvolution.pre[displayedEvolution.pre.length - 1].condition}
                    </ThemedText>
                  </Pressable>
                )}
              </View>
              {/* Évolution suivante directe à droite (première de la liste) */}
              <View style={{ flex: 1, gap: 8 }}>
                {displayedEvolution?.next && displayedEvolution.next.length > 0 && (
                  <Pressable
                    onPress={() => {
                      const targetId = displayedEvolution.next![0].pokedex_id;
                      const targetName = entries.find((e) => e.pokedex_id === targetId && e.region === activeRegion)?.nameSlug ?? entries.find((e) => e.pokedex_id === targetId)?.nameSlug;
                      router.setParams({ id: String(targetId), region: activeRegion ?? undefined, name: targetName ?? undefined });
                    }}
                    style={{ backgroundColor: colors.grayWhite, padding: 12, borderRadius: 8, alignItems: "center" }}
                  >
                    <ThemedText variant="subtitle3">
                      {displayedEvolution.next[0].name} →
                    </ThemedText>
                    <ThemedText variant="caption" color="grayMedium">
                      {displayedEvolution.next[0].condition}
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            </Row>
          )}
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
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
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
