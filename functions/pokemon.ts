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

// ...existing code...

export type EvolutionRule = {
  from: string; // slug
  to: string; // slug
  from_name_fr?: string; // display FR (minuscules)
  to_name_fr?: string; // display FR (minuscules)
  fromRegion?: string | null;
  toRegion?: string | null;
  condition?: string;
};

// Règles d'évolution regroupées par type (tout en minuscules)
export const regionalEvolutions = {
  // normalToNormal : évolution classique sans notion de région
  normalToNormal: [
    {
      from: "racaillou",
      to: "gravalanche",
      from_name_fr: "racaillou",
      to_name_fr: "gravalanche",
      fromRegion: null,
      toRegion: null,
      condition: "niveau 25",
    },
    {
      from: "gravalanche",
      to: "grolem",
      from_name_fr: "gravalanche",
      to_name_fr: "grolem",
      fromRegion: null,
      toRegion: null,
      condition: "échange",
    },
    {
      from: "insécateur",
      to: "hachécateur",
      from_name_fr: "insécateur de hisui",
      to_name_fr: "hachécateur de hisui",
      fromRegion: null,
      toRegion: null,
      condition: "utiliser peau roche à hisui",
    },
    {
      from: "cerfrousse",
      to: "wyrdeer",
      from_name_fr: "cerfrousse de hisui",
      to_name_fr: "wyrdeer de hisui",
      fromRegion: null,
      toRegion: null,
      condition: "utiliser 20 fois fracass'corne style puissance",
    },
    {
      from: "moustillon",
      to: "mateloutre",
      from_name_fr: "moustillon",
      to_name_fr: "mateloutre",
      fromRegion: null,
      toRegion: null,
      condition: "niveau 17",
    },
    // Mime Jr -> Mr. Mime (standard)
    {
      from: "mimejr",
      to: "mmime",
      from_name_fr: "mime jr",
      to_name_fr: "m. mime",
      fromRegion: null,
      toRegion: null,
      // no special condition
    },
    {
      from: "mmime",
      to: null,
      from_name_fr: "m. mime",
      to_name_fr: null,
      fromRegion: null,
      toRegion: null,
      condition: null,
    },
    {
      from: "mateloutre",
      to: "clamiral",
      from_name_fr: "mateloutre",
      to_name_fr: "clamiral",
      fromRegion: null,
      toRegion: null,
      condition: "niveau 36",
    },
    {
      from: "brindibou",
      to: "effleche",
      from_name_fr: "brindibou",
      to_name_fr: "effleche",
      fromRegion: null,
      toRegion: null,
      condition: "niveau 17",
    },
    {
      from: "effleche",
      to: "archeduc",
      from_name_fr: "effleche",
      to_name_fr: "archeduc",
      fromRegion: null,
      toRegion: null,
      condition: "niveau 34",
    },
  ] as EvolutionRule[],

  // normalToRegional : évolution standard -> variante régionale
  normalToRegional: [
    {
      from: "pikachu",
      to: "raichu",
      from_name_fr: "pikachu",
      to_name_fr: "raichu d'alola",
      fromRegion: null,
      toRegion: "alola",
      condition: "pierre foudre à alola",
    },
    {
      from: "noeunoeuf",
      to: "noadkoko",
      from_name_fr: "noeunoeuf",
      to_name_fr: "noadkoko d'alola",
      fromRegion: null,
      toRegion: "alola",
      condition: "pierre soleil à alola",
    },
    {
      from: "osselait",
      to: "ossatueur",
      from_name_fr: "osselait",
      to_name_fr: "ossatueur d'alola",
      fromRegion: null,
      toRegion: "alola",
      condition: "niveau 28 la nuit à alola",
    },

    {
      from: "hericendre",
      to: "feurisson",
      from_name_fr: "héricendre",
      to_name_fr: "feurisson de hisui",
      fromRegion: null,
      toRegion: "hisui",
      condition: "niveau 17 à hisui",
    },
    {
      from: "feurisson",
      to: "typhlosion",
      from_name_fr: "feurisson",
      to_name_fr: "typhlosion de hisui",
      fromRegion: null,
      toRegion: "hisui",
      condition: "niveau 36 à hisui",
    },
    {
      from: "axoloto",
      to: "terraiste",
      from_name_fr: "axoloto",
      to_name_fr: "terraiste de paldea",
      fromRegion: null,
      toRegion: "paldea",
      condition: "niveau 20 à paldea",
    },
    {
      from: "grelaçon",
      to: "seracrawl",
      from_name_fr: "grelaçon de hisui",
      to_name_fr: "seracrawl",
      fromRegion: null,
      toRegion: "hisui",
      condition: "niveau 37 à hisui",
    },
    // Mime Jr -> Mr. Mime (Galar)
    {
      from: "mimejr",
      to: "mmime",
      from_name_fr: "mime jr",
      to_name_fr: "m. mime de galar",
      fromRegion: null,
      toRegion: "galar",
      // no special condition
    },
  ] as EvolutionRule[],

  // regionalToNormal : forme régionale -> forme "standard"
  regionalToNormal: [
    {
      from: "mucuscule",
      to: "colimucus",
      from_name_fr: "mucuscule de hisui",
      to_name_fr: "colimucus",
      fromRegion: "hisui",
      toRegion: null,
      condition: "niveau 40 sous la pluie à hisui",
    },
    {
      from: "lineon",
      to: "ixon",
      from_name_fr: "linéon de galar",
      to_name_fr: "ixon",
      fromRegion: "galar",
      toRegion: null,
      condition: "niveau 35 + nuit",
    },
    {
      from: "corayon",
      to: "corayome",
      from_name_fr: "corayon de galar",
      to_name_fr: "corayome de galar",
      fromRegion: "galar",
      toRegion: null,
      condition: "niveau 38",
    },
    {
      from: "colimucus",
      to: "muplodocus",
      from_name_fr: "colimucus de hisui",
      to_name_fr: "muplodocus",
      fromRegion: "hisui",
      toRegion: null,
      condition: "niveau 50 sous la pluie à hisui",
    },
    {
      from: "canarticho",
      to: "palarticho",
      from_name_fr: "canarticho de galar",
      to_name_fr: "palarticho de galar",
      fromRegion: "galar",
      toRegion: null,
      condition: "3 coups critiques dans un même combat",
    },
    {
      from: "mmime",
      to: "mglaquette",
      from_name_fr: "m. mime de galar",
      to_name_fr: "m. glaquette de galar",
      fromRegion: "galar",
      toRegion: null,
      condition: "niveau 42",
    },
  ] as EvolutionRule[],

  // regionalToRegional : forme régionale -> autre forme régionale (ou espèce distincte si toRegion === null)
  regionalToRegional: [
    {
      from: "rattata",
      to: "rattatac",
      from_name_fr: "rattata",
      to_name_fr: "rattatac d'alola",
      fromRegion: "alola",
      toRegion: "alola",
      condition: "niveau 20 à alola",
    },

    {
      from: "qwilfish",
      to: "qwilpik",
      from_name_fr: "qwilfish de hisui",
      to_name_fr: "qwilpik de hisui",
      fromRegion: "hisui",
      toRegion: "hisui",
      condition: "utiliser 20 fois poing ténèbres style puissant",
    },
    {
      from: "ramoloss",
      to: "flagadoss",
      from_name_fr: "ramoloss de galar",
      to_name_fr: "flagadoss de galar",
      fromRegion: "galar",
      toRegion: "galar",
      condition: "utiliser couronne galar",
    },
    {
      from: "ramoloss",
      to: "roigada",
      from_name_fr: "ramoloss de galar",
      to_name_fr: "roigada de galar",
      fromRegion: "galar",
      toRegion: "galar",
      condition: "échange avec couronne royale galar",
    },

    {
      from: "goupix",
      to: "feunard",
      from_name_fr: "goupix",
      to_name_fr: "feunard d'alola",
      fromRegion: "alola",
      toRegion: "alola",
      condition: "pierre glace à alola",
    },
    {
      from: "sabelette",
      to: "sablaireau",
      from_name_fr: "sabelette",
      to_name_fr: "sablaireau d'alola",
      fromRegion: "alola",
      toRegion: "alola",
      condition: "pierre glace à alola",
    },
    {
      from: "taupiqueur",
      to: "triopikeur",
      from_name_fr: "taupiqueur",
      to_name_fr: "triopikeur d'alola",
      fromRegion: "alola",
      toRegion: "alola",
      condition: "niveau 22 à alola",
    },
    {
      from: "tadmorv",
      to: "grotadmorv",
      from_name_fr: "tadmorv",
      to_name_fr: "grotadmorv d'alola",
      fromRegion: "alola",
      toRegion: "alola",
      condition: "niveau 38 à alola",
    },
    {
      from: "furaiglon",
      to: "gueriaigle",
      from_name_fr: "furaiglon de hisui",
      to_name_fr: "gueriaigle",
      fromRegion: "hisui",
      toRegion: "hisui",
      condition: "niveau 54 à hisui",
    },
  ] as EvolutionRule[],
};

// build a "pre evolutions only" block filtered from above (génère automatiquement)
export const regionalPreEvolutionsOnly = (() => {
  const allEvos = [
    ...regionalEvolutions.normalToNormal,
    ...regionalEvolutions.normalToRegional,
    ...regionalEvolutions.regionalToNormal,
    ...regionalEvolutions.regionalToRegional,
  ];

  const allTo = new Set(allEvos.map((e) => e.to));

  return {
    normalToNormal: regionalEvolutions.normalToNormal.filter(
      (e) => !allTo.has(e.from)
    ),
    normalToRegional: regionalEvolutions.normalToRegional.filter(
      (e) => !allTo.has(e.from)
    ),
    regionalToNormal: regionalEvolutions.regionalToNormal.filter(
      (e) => !allTo.has(e.from)
    ),
    regionalToRegional: regionalEvolutions.regionalToRegional.filter(
      (e) => !allTo.has(e.from)
    ),
  };
})();
