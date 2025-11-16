export function getPokemonId(pokemon: any): number {
  return pokemon.pokedex_id;
}

export function getPokemonArtwork(id: number, region?: string | null): string {
  if (region) {
    // TyraDex format: regular_region.png
    return `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${id}/regular_${region.toLowerCase()}.png`;
  }
  return `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${id}/regular.png`;
}

export function formatWeight(weight?: string): string {
  if (!weight) {
    return "-";
  }
  return weight;
}

export function formatSize(size?: string): string {
  if (!size) {
    return "-";
  }
  return size;
}

export const basePokemonStats = [
    {
      "base_stat": 1,
      "stat": {
        "name": "hp",
      }
    },
    {
      "base_stat": 1,
      "stat": {
        "name": "attack",
      }
    },
    {
      "base_stat": 1,
      "stat": {
        "name": "defense",
      }
    },
    {
      "base_stat": 1,
      "stat": {
        "name": "special-attack",
      }
    },
    {
      "base_stat": 1,
      "stat": {
        "name": "special-defense",
      }
    },
    {
      "base_stat": 1,
      "stat": {
        "name": "speed",
      }
    }
  ];