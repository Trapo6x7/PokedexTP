import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { getPokemonArtwork } from '@/functions/pokemon';

type EvoProps = {
  pokedex_id?: number | null;
  name?: string;
  condition?: string | null;
  onPress?: () => void;
};

export const PokemonEvo: React.FC<EvoProps> = ({ pokedex_id, name, condition, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.evoTile}>
      <View style={styles.evoImageContainer}>
        <Image source={{ uri: getPokemonArtwork(pokedex_id ?? 1) }} style={styles.evoImage} />
      </View>
      <ThemedText variant="subtitle3" style={styles.evoName}>{name}</ThemedText>
      <ThemedText variant="caption" color="grayMedium" style={styles.evoCondition}>{condition}</ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  evoTile: {
    width: 110,
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
