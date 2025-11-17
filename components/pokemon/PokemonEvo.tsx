import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { getPokemonArtwork } from '@/functions/pokemon';

type EvoProps = {
  pokedex_id?: number | null;
  name?: string;
  condition?: string | null;
  region?: string | null;
  onPress?: () => void;
};

export const PokemonEvo: React.FC<EvoProps> = ({ pokedex_id, name, condition, region, onPress }) => {
  const imageUrl = getPokemonArtwork(pokedex_id ?? 1, region);
  
  console.log('PokemonEvo - Name:', name, 'ID:', pokedex_id, 'Region:', region, 'Condition:', condition);

  return (
    <Pressable 
      onPress={() => {
        console.log('PokemonEvo CLICKED - Name:', name, 'ID:', pokedex_id, 'Region:', region);
        onPress?.();
      }} 
      style={styles.evoTile}
    >
      <View style={styles.evoImageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.evoImage} />
      </View>
      <ThemedText variant="subtitle3" style={styles.evoName}>{name}</ThemedText>
      {condition && (
        <ThemedText variant="caption" color="grayMedium" style={styles.evoCondition}>
          {condition}
        </ThemedText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  evoTile: {
    width: 90,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 128,
    justifyContent: 'flex-start',
  },
  evoImageContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evoImage: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  evoName: {
    marginTop: 8,
    textAlign: 'center',
  },
  evoCondition: {
    marginTop: 4,
    minHeight: 20,
    textAlign: 'center',
  },
});

export default PokemonEvo;