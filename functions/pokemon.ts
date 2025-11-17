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
    base_stat: 1,
    stat: {
      name: "hp",
    },
  },
  {
    base_stat: 1,
    stat: {
      name: "attack",
    },
  },
  {
    base_stat: 1,
    stat: {
      name: "defense",
    },
  },
  {
    base_stat: 1,
    stat: {
      name: "special-attack",
    },
  },
  {
    base_stat: 1,
    stat: {
      name: "special-defense",
    },
  },
  {
    base_stat: 1,
    stat: {
      name: "speed",
    },
  },
];

export const specialEvolutions = [
  {
    from: "pikachu",
    fromForm: "alola" as const,
    to: "raichu",
    toForm: "alola" as const,
    conditions: {
      item: "thunder-stone",
    },
  },
  {
    from: "osselait",
    fromForm: "alola" as const,
    to: "ossatueur",
    toForm: "alola" as const,
    conditions: {
      level: 28,
      time: "night",
    },
  },
  {
    from: "miaouss",
    to: "persian",
    conditions: {
      friendship: true,
    },
  },
  {
    from: "miaouss",
    fromForm: "alola" as const,
    to: "persian",
    toForm: "alola" as const,
    conditions: {
      friendship: true,
    },
  },
  {
    from: "miaouss",
    fromForm: "galar" as const,
    to: "berserkatt",
    conditions: {
      level: 28,
    },
  },
  {
    from: "axoloto",
    fromForm: "paldea" as const,
    to: "terraiste",
    conditions: {
      level: 20,
    },
  },
  {
    from: "axoloto",
    to: "maraiste",
    conditions: {
      level: 20,
    },
  },
  {
    from: "ramoloss",
    fromForm: "galar" as const,
    to: "flagadoss",
    toForm: "galar" as const,
    conditions: {
      item: "galarica-cuff",
    },
  },
  {
    from: "ramoloss",
    fromForm: "galar" as const,
    to: "roigada",
    toForm: "galar" as const,
    conditions: {
      item: "galarica-wreath",
    },
  },
  {
    from: "caninos",
    fromForm: "hisui" as const,
    to: "arcanin",
    toForm: "hisui" as const,
    conditions: {
      item: "fire-stone",
    },
  },
  {
    from: "goupix",
    fromForm: "alola" as const,
    to: "feunard",
    toForm: "alola" as const,
    conditions: {
      item: "ice-stone",
    },
  },
  {
    from: "bargantua",
    to: "paragruel",
    conditions: {
      selfDamage: 294,
    },
  },
  {
    from: "canarticho",
    fromForm: "galar" as const,
    to: "palarticho",
    conditions: {
      criticalHitsInOneBattle: 3,
    },
  },
  {
    from: "qwilfish",
    fromForm: "hisui" as const,
    to: "qwilpik",
    conditions: {
      moveCount: {
        move: "barb-barrage",
        times: 20,
      },
    },
  },
  {
    from: "cerfrousse",
    to: "cerbyllin",
    conditions: {
      moveCount: {
        move: "psyshield-bash",
        times: 20,
      },
    },
  },
] as const;

export type SpecialEvolution = (typeof specialEvolutions)[number];
