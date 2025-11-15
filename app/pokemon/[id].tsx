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
import { Audio } from "expo-av";

export default function Pokemon() {
  const colors = useThemeColors();
  const params = useLocalSearchParams() as { id: string };
  const { data: pokemon } = useFetchQuery("/pokemon/[id]", { id: params.id });
  const id = parseInt(params.id, 10);
  const { data: species } = useFetchQuery("/pokemon-species/[id]", {
    id: params.id,
  });
  const mainType = pokemon?.types?.[0].type.name;
  const colorType = mainType ? Colors.type[mainType] : colors.tint;
  const types = pokemon?.types ?? [];
  const bio = species?.flavor_text_entries
    ?.find(({ language }) => language.name === "en")
    ?.flavor_text.replaceAll("\n", " ");
  const stats = pokemon?.stats ?? basePokemonStats;
  const onImagePress = async () => {
    const cry = pokemon?.cries.latest;
    if (!cry) {
      return;
    }
    const { sound } = await Audio.Sound.createAsync(
      {
        uri: cry,
      },
      { shouldPlay: true }
    );
    sound.playAsync();
  };

  const { data: pokemonListMeta } = useFetchQuery("/pokemon?limit=21");
  const totalPokemon = pokemonListMeta?.count ?? 1025;

  const onPrevious = () =>
    router.setParams({
      id: String(Math.max(id - 1, 1)),
    });
  const onNext = () =>
    router.setParams({
      id: String(Math.min(id + 1, totalPokemon)),
    });

    const isFirst = id === 1;
    const isLast = id === totalPokemon;

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
            {pokemon?.name
              ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
              : ""}
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
            <Pressable onPress={onImagePress}>
              <Image
                source={{
                  uri: getPokemonArtwork(params.id),
                }}
                style={[{ width: 200, height: 200 }, styles.artwork]}
              />
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
            <Row gap={16} style={{ height: 20 }}>
              {types.map((type) => (
                <PokemonType name={type.type.name} key={type.type.name} />
              ))}
            </Row>
            <ThemedText variant="subtitle1" style={{ color: colorType }}>
              About
            </ThemedText>
            <Row>
              <PokemonSpec
                style={{
                  borderStyle: "solid",
                  borderRightWidth: 1,
                  borderColor: colors.grayLight,
                }}
                title={formatWeight(pokemon?.weight)}
                description="Weight"
                image={require("@/assets/images/weight.png")}
              />
              <PokemonSpec
                // style={{
                //   borderStyle: "solid",
                //   borderRightWidth: 1,
                //   borderColor: colors.grayLight,
                // }}
                title={formatSize(pokemon?.height)}
                description="Height"
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
            <ThemedText style={{ alignItems: "center" }}>{bio}</ThemedText>
            <ThemedText variant="subtitle1" style={{ color: colorType }}>
              Base stats
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
          </Card>
     
      </View>
    </RootView>
  );
}

const styles = StyleSheet.create({
  header: { margin: 20, justifyContent: "space-between" },
  pokeball: { opacity: 0.1, position: "absolute", right: 8, top: 8 },
  artwork: { alignSelf: "center" },
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
