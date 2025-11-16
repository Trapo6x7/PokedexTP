import { Image, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Card } from "../Card";
import { ThemedText } from "../ThemedText";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Link } from "expo-router";
import { getPokemonArtwork } from "@/functions/pokemon";

type Props = {
  style?: ViewStyle;
  id: number;
  name: string;
  region?: string | null;
  nameSlug?: string | null;
  spriteUrl?: string;
  pokedex?: "national" | "alola" | "galar" | "hisui" | "paldea" | string | null;
  apiId?: number | string | null;
};

export function PokemonCard({ style, id, name, region, nameSlug, spriteUrl, pokedex, apiId }: Props) {
  const colors = useThemeColors();
  
  // Always link to the single layout `/pokemon/[id]` and include region in query when available
  // Pass the `name` slug together with pokedex id + region so the details page
  // can use `/pokemon/[name]/[region]` to fetch regional stats and types.
  const href = {
    pathname: "/pokemon/[id]" as const,
    params: {
      id: apiId ?? id,
      region: region ?? undefined,
      name: nameSlug ?? undefined,
      pokedex,
    },
  };
  
  // Use provided sprite URL or fallback to getPokemonArtwork
  const imageUrl = spriteUrl || getPokemonArtwork(id);
  
  return (
    <Link href={href} asChild>
      <Pressable
        android_ripple={{ color: colors.tint, foreground: true }}
        style={style}
      >
        <Card style={[styles.card]}>
          <View
            style={[styles.shadow, { backgroundColor: colors.grayBackground }]}
          />
          <ThemedText style={styles.id} variant="caption" color="grayMedium">
            #{id.toString().padStart(3, "0")}
          </ThemedText>
          <Image
            source={{
              uri: imageUrl,
            }}
            style={{ width: 72, height: 72 }}
          />
          <ThemedText>{name}</ThemedText>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", padding: 4, position: "relative" },
  id: { alignSelf: "flex-end" },
  shadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    borderRadius: 7,
  },
});
