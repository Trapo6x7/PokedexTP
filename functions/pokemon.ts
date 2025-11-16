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

  export const specialEvolutions = [
  {
    from: "pikachu",
    fromForm: "alola",
    to: "raichu",
    toForm: "alola",
    conditions: {
      item: "thunder-stone"
    }
  },
  {
    from: "cubone",
    fromForm: "alola",
    to: "marowak",
    toForm: "alola",
    conditions: {
      level: 28,
      time: "night"
    }
  },
  {
    from: "wooper",
    fromForm: "paldea",
    to: "clodsire",
    conditions: {
      level: 20
    }
  },
  {
    from: "slowpoke",
    fromForm: "galar",
    to: "slowbro",
    toForm: "galar",
    conditions: {
      item: "galarica-cuff"
    }
  },
  {
    from: "slowpoke",
    fromForm: "galar",
    to: "slowking",
    toForm: "galar",
    conditions: {
      item: "galarica-wreath"
    }
  },
  {
    from: "growlithe",
    fromForm: "hisui",
    to: "arcanine",
    toForm: "hisui",
    conditions: {
      item: "fire-stone"
    }
  },
  {
    from: "vulpix",
    fromForm: "alola",
    to: "ninetales",
    toForm: "alola",
    conditions: {
      item: "ice-stone"
    }
  },
  {
    from: "basculin",
    fromForm: "white-striped",
    to: "basculegion",
    conditions: {
      selfDamage: 294
    }
  },
  {
    from: "qwilfish",
    fromForm: "hisui",
    to: "overqwil",
    conditions: {
      moveCount: {
        move: "barb-barrage",
        times: 20
      }
    }
  },
  {
    from: "stantler",
    to: "wyrdeer",
    conditions: {
      moveCount: {
        move: "psyshield-bash",
        times: 20
      }
    }
  }
] as const;

export type SpecialEvolution = typeof specialEvolutions[number];