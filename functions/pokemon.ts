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




// Règles d'évolution SPÉCIALES pour les formes régionales
export const regionalEvolutions = {
  // TYPE 1: Pokémon standard qui peut évoluer en forme régionale (fromRegion: null)
  standardToRegional: [
    { from: "pikachu", to: "raichu", region: "alola", fromRegion: null },
    { from: "noeunoeuf", to: "noadkoko", region: "alola", fromRegion: null },
    { from: "osselait", to: "ossatueur", region: "alola", fromRegion: null },
    { from: "smogo", to: "smogogo", region: "galar", fromRegion: null },
    { from: "hericendre", to: "feurisson", region: "hisui", fromRegion: null },
    { from: "feurisson", to: "typhlosion", region: "hisui", fromRegion: null },
    { from: "moustillon", to: "mateloutre", region: "hisui", fromRegion: null },
    { from: "mateloutre", to: "clamiral", region: "hisui", fromRegion: null },
    { from: "chlorobule", to: "fragilady", region: "hisui", fromRegion: null },
    { from: "mucuscule", to: "colimucus", region: "hisui", fromRegion: null },
    { from: "colimucus", to: "muplodocus", region: "hisui", fromRegion: null },
    { from: "furaiglon", to: "gueriaigle", region: "hisui", fromRegion: null },
    { from: "grelaçon", to: "seracrawl", region: "hisui", fromRegion: null },
    { from: "brindibou", to: "effleche", region: "hisui", fromRegion: null },
    { from: "effleche", to: "archeduc", region: "hisui", fromRegion: null },
  ],
  
  // TYPE 2: Forme régionale qui évolue en quelque chose de différent de la forme standard
  regionalToDifferent: [
    { from: "miaouss", fromRegion: "galar", to: "berserkatt", toRegion: null }, // Berserkatt n'a pas de région
    { from: "axoloto", fromRegion: "paldea", to: "terraiste", toRegion: null }, // Terraiste n'a pas de région
    { from: "farfuret", fromRegion: "hisui", to: "farfurex", toRegion: null }, // Farfurex n'a pas de région
    { from: "tutafeh", fromRegion: "galar", to: "tuteteri", toRegion: null }, // Tutétékri n'a pas de région
  ],
  
  // TYPE 3: Forme régionale qui peut évoluer (forme standard ne peut pas)
  regionalOnlyEvolution: [
    { from: "canarticho", fromRegion: "galar", to: "palarticho", toRegion: "galar" },
    { from: "mmime", fromRegion: "galar", to: "mglaquette", toRegion: "galar" },
    { from: "corayon", fromRegion: "galar", to: "corayome", toRegion: "galar" },
    { from: "lineon", fromRegion: "galar", to: "ixon", toRegion: "galar" },
    { from: "qwilfish", fromRegion: "hisui", to: "qwilpik", toRegion: "hisui" },
    { from: "ramoloss", fromRegion: "galar", to: "flagadoss", toRegion: "galar" },
    { from: "ramoloss", fromRegion: "galar", to: "roigada", toRegion: "galar" },
  ],
} as const;


export type RegionalEvolution = {
  from: string;
  to: string;
  fromRegion?: string | null;
  region?: string;
  toRegion?: string;
};

export type RegionName = "alola" | "galar" | "hisui" | "paldea";