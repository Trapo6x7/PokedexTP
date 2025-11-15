import { Card } from "@/components/Card";
import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { RootView } from "@/components/RootView";
import { Row } from "@/components/Row";
import { SearchBar } from "@/components/SearchBar";
import { SortButton } from "@/components/SortButton";
import { ThemedText } from "@/components/ThemedText";
import { getPokemonId } from "@/functions/pokemon";
import { useFetchQuery, useInfiniteFetchQuery } from "@/hooks/useFetchQuery";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useState } from "react";
import { StyleSheet, Image, FlatList, ActivityIndicator } from "react-native";

export default function Index() {
  const colors = useThemeColors();
  const { data, isLoading, isFetchingNextPage, fetchNextPage } =
    useInfiniteFetchQuery("/pokemon?limit=21");
  const pokemons =
    data?.pages.flatMap((page) =>
      page.results.map((r) => ({ name: r.name, id: getPokemonId(r.url) }))
    ) ?? [];
  const [sortKey, setSortKey] = useState<"id" | "name">("id");
  const [search, setSearch] = useState("");
  const filteredPokemon = [
    ...(search
      ? pokemons.filter(
          (p) =>
            p.name.includes(search.toLowerCase()) || p.id.toString() === search
        )
      : pokemons),
  ].sort((a, b) => (a[sortKey] < b[sortKey] ? -1 : 1));

  return (
    <RootView bakcgroundColor={colors.tint}>
      <Row style={styles.header} gap={16}>
        <Image
          source={require("@/assets/images/pokeball.png")}
          style={{ width: 24, height: 24 }}
        />
        <ThemedText variant="headline" color="grayLight">
          Trapokédex
        </ThemedText>
      </Row>
      <Row gap={16} style={styles.form}>
        <SearchBar value={search} onChange={setSearch} />
        <SortButton value={sortKey} onChange={setSortKey} />
      </Row>
      <Card style={styles.body}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.grayWhite} />
        ) : (
          <FlatList
            data={filteredPokemon}
            numColumns={3}
            columnWrapperStyle={styles.gridGap}
            contentContainerStyle={[styles.gridGap, styles.list]}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="large" color={colors.tint} />
              ) : null
            }
            onEndReached={() => fetchNextPage()}
            renderItem={({ item }) => (
              <PokemonCard
                id={item.id}
                name={item.name}
                style={{ flex: 1 / 3 }}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </Card>
    </RootView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 12 },
  body: { flex: 1, marginTop: 8 },
  gridGap: { gap: 8 },
  list: { padding: 12 },
  form: {paddingHorizontal:12}
});
