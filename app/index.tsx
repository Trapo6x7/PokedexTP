import { Card } from "@/components/Card";
import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { RootView } from "@/components/RootView";
import { Row } from "@/components/Row";
import { SearchBar } from "@/components/SearchBar";
import { SortButton } from "@/components/SortButton";
import { ThemedText } from "@/components/ThemedText";
import { useFetchQuery } from "@/hooks/useFetchQuery";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useState, useMemo } from "react";
import {
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  View,
} from "react-native";

export default function Index() {
  const colors = useThemeColors();
  const { data: pokemonsData, isLoading } = useFetchQuery("/pokemon");
  // currently used to select which Pokédex to display
  const [activePokedex, setActivePokedex] = useState<
    "national" | "alola" | "galar" | "hisui" | "paldea"
  >("national");
  const [search, setSearch] = useState("");

  // Get all pokemon with regional forms
  const pokemonWithForms = useMemo(() => {
    return (pokemonsData ?? []).filter((p) => p.formes && p.formes.length > 0);
  }, [pokemonsData]);

  // Fetch regional forms data
  const regionalFormsQueries = pokemonWithForms
    .map((pokemon) => {
      return pokemon.formes!.map((forme) => ({
        pokemon,
        forme,
        // We'll fetch these manually
      }));
    })
    .flat();

  // Flatten the data to include regional forms as separate entries
  const allPokemons = useMemo(() => {
    const entries = (pokemonsData ?? []).map((pokemon) => ({
      pokedex_id: pokemon.pokedex_id,
      name: pokemon.name,
      sprites: pokemon.sprites,
      types: pokemon.types,
      region: null as string | null,
      nameSlug: null as string | null,
    }));

    // Add regional forms
    regionalFormsQueries.forEach(({ pokemon, forme }) => {
      // Generate regional form sprites URLs
      const regionalSprites = {
        regular: `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokemon.pokedex_id}/regular_${forme.region}.png`,
        shiny: `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokemon.pokedex_id}/shiny_${forme.region}.png`,
        gmax: null,
      };

      entries.push({
        pokedex_id: pokemon.pokedex_id,
        name: forme.name,
        sprites: regionalSprites,
        types: pokemon.types,
        region: forme.region,
        nameSlug: pokemon.name.fr
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""),
      });
    });

    return entries;
  }, [pokemonsData, regionalFormsQueries.length]);

  // Filter by selected pokedex. national = base entries (region === null)
  const pokemonForSelectedPokedex = allPokemons.filter((p) =>
    activePokedex === "national" ? p.region === null : p.region === activePokedex
  );

  // Si une recherche est active, chercher dans TOUS les pokémons (toutes régions)
  // Sinon, filtrer par le pokédex sélectionné
  const baseList = search.trim() ? allPokemons : pokemonForSelectedPokedex;

  const filteredPokemon = baseList.filter((p) => {
    // Normalize both search term and pokemon name for comparison
    const normalizedSearch = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    
    const normalizedName = p.name.fr
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    
    return normalizedName.includes(normalizedSearch);
  });


  // Order by pokedex index; if equal use localized name
  const sortedPokemon = [...filteredPokemon].sort((a, b) => {
    if (a.pokedex_id === 0) return 1;
    if (b.pokedex_id === 0) return -1;

    if (a.pokedex_id !== b.pokedex_id) return a.pokedex_id - b.pokedex_id;

    return a.name.fr.localeCompare(b.name.fr);
  });

  return (
    <RootView bakcgroundColor={colors.tint}>
      <Row style={styles.header} gap={12}>
        <Image
          source={require("@/assets/images/pokedex.png")}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
        <SearchBar value={search} onChange={setSearch} />
        <SortButton value={activePokedex} onChange={setActivePokedex} />
      </Row>
      <Card style={styles.body}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.grayWhite} />
        ) : (
          <FlatList
            data={sortedPokemon}
            numColumns={3}
            columnWrapperStyle={styles.gridGap}
            contentContainerStyle={[styles.gridGap, styles.list]}
            ListFooterComponent={<View style={{ height: 16 }} />}
            renderItem={({ item }) => (
              <PokemonCard
                id={item.pokedex_id}
                name={item.name.fr}
                region={item.region}
                nameSlug={item.nameSlug}
                spriteUrl={item.sprites.regular}
                pokedex={activePokedex}
                style={{ flex: 1 / 3 }}
              />
            )}
            keyExtractor={(item) =>
              item.region
                ? `${item.pokedex_id}-${item.region}`
                : item.pokedex_id.toString()
            }
          />
        )}
      </Card>
    </RootView>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  gridGap: { gap: 8 },
  list: { padding: 12 },
  header: { paddingHorizontal: 12, paddingTop: 16, alignItems: "center" },
});
