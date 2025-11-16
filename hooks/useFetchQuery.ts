import { Colors } from "@/constants/Colors";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const endpoint = "https://tyradex.vercel.app/api/v1";

type API = {
  "/pokemon": {
    pokedex_id: number;
    generation: number;
    name: {
      fr: string;
      en: string;
      jp: string;
    };
    sprites: {
      regular: string;
      shiny: string | null;
      gmax: string | null;
    };
    types: Array<{
      name: string;
      image: string;
    }>;
    formes: Array<{
      region: string;
      name: {
        fr: string;
        en: string;
        jp: string;
      };
    }> | null;
  }[];
  "/pokemon/[name]/[region]": {
    pokedex_id: number;
    generation: number;
    category: string;
    name: {
      fr: string;
      en: string;
      jp: string;
    };
    sprites: {
      regular: string;
      shiny: string | null;
      gmax: null;
    };
    types: Array<{
      name: string;
      image: string;
    }>;
    stats: {
      hp: number;
      atk: number;
      def: number;
      spe_atk: number;
      spe_def: number;
      vit: number;
    };
    height: string;
    weight: string;
    evolution: {
      pre: Array<{
        pokedex_id: number;
        name: string;
        condition: string;
      }> | null;
      next: Array<{
        pokedex_id: number;
        name: string;
        condition: string;
      }> | null;
      mega: null;
    };
  };
  "/gen/all": {
    pokedex_id: number;
    generation: number;
    category: string;
    name: {
      fr: string;
      en: string;
      jp: string;
    };
    sprites: {
      regular: string;
      shiny: string | null;
      gmax: string | null;
    };
    types: Array<{
      name: string;
      image: string;
    }>;
    formes: Array<{
      region: string;
      name: {
        fr: string;
        en: string;
        jp: string;
      };
    }> | null;
  }[];
  "/pokemon/[id]": {
    pokedex_id: number;
    generation: number;
    category: string;
    name: {
      fr: string;
      en: string;
      jp: string;
    };
    sprites: {
      regular: string;
      shiny: string | null;
      gmax: {
        regular: string;
        shiny: string;
      } | null;
    };
    types: Array<{
      name: string;
      image: string;
    }>;
    talents: Array<{
      name: string;
      tc: boolean;
    }>;
    stats: {
      hp: number;
      atk: number;
      def: number;
      spe_atk: number;
      spe_def: number;
      vit: number;
    };
    resistances: Array<{
      name: string;
      multiplier: number;
    }>;
    evolution: {
      pre: Array<{
        pokedex_id: number;
        name: string;
        condition: string;
      }> | null;
      next: Array<{
        pokedex_id: number;
        name: string;
        condition: string;
      }> | null;
      mega: Array<{
        orbe: string;
        sprites: {
          regular: string;
          shiny: string;
        };
      }> | null;
    };
    height: string;
    weight: string;
    egg_groups: string[];
    sexe: {
      male: number;
      female: number;
    };
    catch_rate: number;
    level_100: number;
    formes: any;
  };
};

// Export type for PokemonEntry (based on the structure you're using in your app)
export type PokemonEntry = {
  pokedex_id: number;
  generation: number;
  category?: string;
  name: {
    fr: string;
    en: string;
    jp: string;
  };
  nameSlug?: string | null;
  region?: string | null;
  sprites: {
    regular: string;
    shiny: string | null;
    gmax?: string | null;
  };
  types: Array<{
    name: string;
    image: string;
  }>;
  formes?: Array<{
    region: string;
    name: {
      fr: string;
      en: string;
      jp: string;
    };
  }> | null;
};

export function useFetchQuery<T extends keyof API>(
  path: T,
  params?: Record<string, string | number>
) {
  const localUrl = Object.entries(params ?? {}).reduce(
    (acc, [key, value]) => acc.replaceAll(`[${key}]`, value.toString()),
    path as string
  );
  return useQuery({
    queryKey: [path, params],
    // Only run parameterized endpoints (containing [param]) when params are provided
    enabled:
      Object.keys(params ?? {}).length > 0 || !/\[.*\]/.test(path as string),
    queryFn: async () => {
      await wait(0);
      return fetch(endpoint + localUrl, {
        headers: {
          Accept: "application/json",
        },
      }).then((r) => r.json() as Promise<API[T]>);
    },
  });
}

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration * 1000));
}