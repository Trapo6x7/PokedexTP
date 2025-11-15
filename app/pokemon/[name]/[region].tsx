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
} from "@/functions/pokemon";
import { useFetchQuery } from "@/hooks/useFetchQuery";
import { useThemeColors } from "@/hooks/useThemeColors";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";

export default function RegionalPokemon() {
  const colors = useThemeColors();
  const params = useLocalSearchParams() as { name: string; region: string };
  const { data: pokemon } = useFetchQuery("/pokemon/[name]/[region]", { name: params.name, region: params.region });
  const { data: allPokemons } = useFetchQuery("/pokemon");
  const [currentForm, setCurrentForm] = useState<"regular" | "shiny">("regular");
  
  // Get available forms (regional forms don't have mega/gmax)
  const availableForms: Array<"regular" | "shiny"> = ["regular"];
  if (pokemon?.sprites.shiny) {
    availableForms.push("shiny");
  }
  
  // Check if Pokemon has only regular sprite
  const hasOnlyRegularSprite = availableForms.length === 1;
  
  // Get current sprite URL based on form
  const getCurrentSprite = (): string => {
    if (!pokemon) return "";
    
    if (currentForm === "shiny" && pokemon.sprites.shiny) {
      return pokemon.sprites.shiny;
    }
    
    return pokemon.sprites.regular;
  };
  
  // Cycle through available forms
  const toggleForm = () => {
    const currentIndex = availableForms.indexOf(currentForm);
    const nextIndex = (currentIndex + 1) % availableForms.length;
    setCurrentForm(availableForms[nextIndex]);
  };
  
  const mainType = pokemon?.types?.[0]?.name?.toLowerCase();
  const colorType = (mainType && Colors.type[mainType as keyof typeof Colors.type]) || colors.tint;
  const types = pokemon?.types ?? [];
  const bio = pokemon?.category;
  const stats = pokemon?.stats
    ? [
        { stat: { name: "hp" }, base_stat: pokemon.stats.hp },
        { stat: { name: "atk" }, base_stat: pokemon.stats.atk },
        { stat: { name: "def" }, base_stat: pokemon.stats.def },
        { stat: { name: "spe-atk" }, base_stat: pokemon.stats.spe_atk },
        { stat: { name: "spe-def" }, base_stat: pokemon.stats.spe_def },
        { stat: { name: "vit" }, base_stat: pokemon.stats.vit },
      ]
    : basePokemonStats;

  const id = pokemon?.pokedex_id ?? 1;

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
            {pokemon?.name.fr || ""}
          </ThemedText>
          <ThemedText color="grayWhite" variant="subtitle2">
            #{id.toString().padStart(3, "0")}
          </ThemedText>
        </Row>

        <Card style={styles.card}>
          <Row style={styles.imageRow}>
            <View style={{ width: 24, height: 24 }}></View>
            <Pressable onPress={hasOnlyRegularSprite ? undefined : toggleForm} disabled={hasOnlyRegularSprite} style={styles.spriteContainer}>
              <Image
                source={{
                  uri: getCurrentSprite(),
                }}
                style={[{ width: 220, height: 220 }, styles.artwork]}
              />
            </Pressable>
            <View style={{ width: 24, height: 24 }}></View>
          </Row>
          <Row gap={16} style={{ height: 20 }}>
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
              title={formatWeight(pokemon?.weight)}
              description="Poids"
              image={require("@/assets/images/weight.png")}
            />
            <PokemonSpec
              title={formatSize(pokemon?.height)}
              description="Taille"
              image={require("@/assets/images/straighten.png")}
            />
          </Row>

          <ThemedText style={{ alignItems: "center" }}>{bio}</ThemedText>
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
                {pokemon?.evolution?.pre && pokemon.evolution.pre.length > 0 && (
                  <View
                    style={{ backgroundColor: colors.grayWhite, padding: 12, borderRadius: 8, alignItems: "center" }}
                  >
                    <ThemedText variant="subtitle3">
                      ← {pokemon.evolution.pre[pokemon.evolution.pre.length - 1].name}
                    </ThemedText>
                    <ThemedText variant="caption" color="grayMedium">
                      {pokemon.evolution.pre[pokemon.evolution.pre.length - 1].condition}
                    </ThemedText>
                  </View>
                )}
              </View>
              {/* Évolution suivante directe à droite (première de la liste) */}
              <View style={{ flex: 1, gap: 8 }}>
                {pokemon?.evolution?.next && pokemon.evolution.next.length > 0 && (
                  <View
                    style={{ backgroundColor: colors.grayWhite, padding: 12, borderRadius: 8, alignItems: "center" }}
                  >
                    <ThemedText variant="subtitle3">
                      {pokemon.evolution.next[0].name} →
                    </ThemedText>
                    <ThemedText variant="caption" color="grayMedium">
                      {pokemon.evolution.next[0].condition}
                    </ThemedText>
                  </View>
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
  artwork: { alignSelf: "center", top: -20 },
  spriteContainer: {
    position: "relative",
    borderRadius: 110,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
    alignItems: "center",
    marginTop: 144,
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
