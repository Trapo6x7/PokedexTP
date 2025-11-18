import React from "react";
import { View, ScrollView } from "react-native";
import { Row } from "../Row";
import { PokemonEvo } from "./PokemonEvo";
import { ThemedText } from "../ThemedText";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { PokemonEntry } from "@/hooks/useFetchQuery";
import { regionalEvolutions, getPokemonArtwork } from "@/functions/pokemon";

interface EvolutionEntry {
  pokedex_id: number;
  name: string;
  condition?: string;
  region?: string | null; // Add region to track which variant
}

// Match the exact structure from Tyradex API
interface DisplayedEvolution {
  pre: EvolutionEntry[] | null;
  next: EvolutionEntry[] | null;
  mega: any[] | null;
}

interface PokemonEvolutionsProps {
  chainPre: EvolutionEntry[];
  chainNext: EvolutionEntry[];
  chainStageNumber: number | null;
  displayedEvolution: DisplayedEvolution | null | undefined;
  colorType: string;
  currentPokedexId: number;
  currentRegion?: string | null;
  entries: PokemonEntry[];
  onNavigate: (pokedexId: number, region?: string | null) => void;
}

export function PokemonEvolutions({
  chainPre,
  chainNext,
  chainStageNumber,
  displayedEvolution,
  colorType,
  currentPokedexId,
  currentRegion,
  entries,
  onNavigate,
}: PokemonEvolutionsProps) {
  const colors = useThemeColors();

  // Helper: normalize name for comparison
  const normalizeName = (name?: string | null) =>
    (name ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const filterEvolutionsByRegion = (
    evolutions: EvolutionEntry[],
    isPre: boolean = false
  ): EvolutionEntry[] => {
    if (!Array.isArray(evolutions) || evolutions.length === 0) return [];

    const currentPokemon =
      entries.find(
        (e) => e.pokedex_id === currentPokedexId && e.region === currentRegion
      ) || entries.find((e) => e.pokedex_id === currentPokedexId);

      
    if (!currentPokemon) return evolutions;

    const currentIsRegional = currentPokemon.region !== null;
    const currentRegionName = currentPokemon.region as string | null;
    // Use French name slug for comparison with regionalEvolutions
    // Remove region suffix (e.g., "miaouss de galar" -> "miaouss")
    // Ensure we always normalize the slug — Tyradex sometimes uses dots like 'm.mime' or 'm.glaquette'.
    const currentRawSlug = currentPokemon.nameSlug ?? currentPokemon.name.fr;
    let currentNameSlug = normalizeName(currentRawSlug);
    
    // Clean up regional suffixes for matching with rules
    const regionalSuffixes = ["dalola", "de galar", "dhisui", "de paldea"];
    regionalSuffixes.forEach(suffix => {
      const normalizedSuffix = normalizeName(suffix);
      if (currentNameSlug.endsWith(normalizedSuffix)) {
        currentNameSlug = currentNameSlug.slice(0, -normalizedSuffix.length).trim();
      }
    });

    // Dev logs specifically for mglaquette when current is mglaquette
    if (__DEV__ && currentNameSlug === "mglaquette") {
      const allRules = [
        ...regionalEvolutions.normalToNormal,
        ...regionalEvolutions.normalToRegional,
        ...regionalEvolutions.regionalToNormal,
        ...regionalEvolutions.regionalToRegional,
      ];
      const rulesForMg = allRules.filter((r) => normalizeName(r.from) === "mglaquette" || normalizeName(r.to) === "mglaquette");

      console.log("[EVO MGCTX] Current mglaquette context", {
        currentPokemon,
        currentRegionName,
        currentIsRegional,
        rulesForMg,
        currentRawSlug,
        currentNameSlugNormalized: currentNameSlug,
      });
    }

    // Lenient check: if slug contains 'mmime' (ex: 'mmimedegalar') treat as mmime for debug
    if (__DEV__ && currentNameSlug.includes("mmime") && currentRegionName === "galar") {
      const allRules = [
        ...regionalEvolutions.normalToNormal,
        ...regionalEvolutions.normalToRegional,
        ...regionalEvolutions.regionalToNormal,
        ...regionalEvolutions.regionalToRegional,
      ];
      const rulesForMmLike = allRules.filter((r) => normalizeName(r.from).includes("mmime") || normalizeName(r.to).includes("mmime"));
      console.log("[EVO MMCTX-LEV] mmime-like context", { currentNameSlug, currentPokemon, currentRegionName, currentIsRegional, rulesForMmLike });
    }

    // Lenient check: if slug contains 'mglaquette' (ex: 'm.glaquette') treat as mglaquette for debug
    if (__DEV__ && currentNameSlug.includes("mglaquette")) {
      const allRules = [
        ...regionalEvolutions.normalToNormal,
        ...regionalEvolutions.normalToRegional,
        ...regionalEvolutions.regionalToNormal,
        ...regionalEvolutions.regionalToRegional,
      ];
      const rulesForMgLike = allRules.filter((r) => normalizeName(r.from).includes("mglaquette") || normalizeName(r.to).includes("mglaquette"));
      console.log("[EVO MGCTX-LEV] mglaquette-like context", { currentNameSlug, currentPokemon, currentRegionName, currentIsRegional, rulesForMgLike });
    }

    // Extra mmime/galar-specific debug logs for deeper tracing
    if (__DEV__ && currentNameSlug.includes("mmime") && currentRegionName === "galar") {
      console.log("[EVO MMCTX-GALAR] mmime de Galar - context", {
        currentNameSlug,
        currentPokemon,
        currentRegionName,
        currentIsRegional,
        evolutionsCount: evolutions.length,
        entriesCount: entries.length,
      });
    }

    // Extra mglaquette-specific debug logs (mirror mmime Galar logs) so we can compare
    if (__DEV__ && currentNameSlug.includes("mglaquette")) {
      console.log("[EVO MGCTX-GLOBAL] m.glaquette context", {
        currentNameSlug,
        currentPokemon,
        currentRegionName,
        currentIsRegional,
        evolutionsCount: evolutions.length,
        entriesCount: entries.length,
      });
    }

    const filtered: EvolutionEntry[] = [];

    evolutions.forEach((evo) => {
      // Get normalized names for regional evolution matching
      let evoNameSlug = normalizeName(evo.name);
      // Strip regional suffixes from candidate evolution names as well
      regionalSuffixes.forEach((suffix) => {
        const normalizedSuffix = normalizeName(suffix);
        if (evoNameSlug.endsWith(normalizedSuffix)) {
          evoNameSlug = evoNameSlug.slice(0, -normalizedSuffix.length).trim();
        }
      });
      
      // For TYPE 2: Check if current regional form has a different evolution
      // This used to be a single "regionalToDifferent" array; we now support
      // separate mappings for regional->standard and regional->region.
      if (currentIsRegional) {
        const allRegionalSpecial = [
          ...regionalEvolutions.regionalToNormal,
          ...regionalEvolutions.regionalToRegional,
        ];

        const specialEvo = allRegionalSpecial.find((re) => {
          const fromMatch = normalizeName(re.from) === currentNameSlug;
          const regionMatch = re.fromRegion === currentRegionName;
          const toMatch = normalizeName(re.to) === evoNameSlug;

          return fromMatch && regionMatch && toMatch;
        });

        if (specialEvo) {
          // This is the special evolution for this regional form - just add it directly
          if (__DEV__ && evoNameSlug === "mglaquette") {
            console.log("[EVO MG] specialEvo matched", {
              currentNameSlug,
              currentRegionName,
              currentIsRegional,
              evoNameSlug,
              specialEvo,
            });
          }
          filtered.push({
            pokedex_id: evo.pokedex_id,
            name: evo.name,
            condition: evo.condition,
            region: specialEvo.toRegion,
          });
          return;
        }
      }
      
      const evoVariants = entries.filter(
        (e) => e.pokedex_id === evo.pokedex_id
      );

      if (evoVariants.length === 0) {
        filtered.push(evo);
        return;
      }

      // Check for regional evolution rules
      // TYPE 1: Standard can evolve to regional form
      const standardToRegionalRule = regionalEvolutions.normalToRegional.find((re) => {
        const matchesNames = isPre
          ? normalizeName(re.to) === currentNameSlug &&
            normalizeName(re.from) === evoNameSlug
          : normalizeName(re.from) === currentNameSlug &&
            normalizeName(re.to) === evoNameSlug;
        return matchesNames && currentRegionName === null;
      });

      // Debug: check mglaquette references
      if (__DEV__ && evoNameSlug === "mglaquette") {
        console.log("[EVO MG] Checking mglaquette candidate:", {
          evo,
          evoNameSlug,
          currentNameSlug,
          currentRegionName,
          currentIsRegional,
          evoVariants: evoVariants.map((v) => ({ pokedex_id: v.pokedex_id, region: v.region, name: v.name?.fr, sprites: Boolean(v.sprites) })),
          standardToRegionalRule,
        });
      }

      // Debug for mmime (target stage or source)
      if (__DEV__ && currentNameSlug.includes("mmime") && currentRegionName === "galar") {
        console.log("[EVO MMBASIC] mmime(galar) - candidate check", {
          evoNameSlug,
          evoPokedexId: evo.pokedex_id,
          evoCondition: evo.condition,
          evoVariants: evoVariants.map((v) => ({ pokedex_id: v.pokedex_id, region: v.region, name: v.name?.fr })),
          isPre,
        });
      }

      // Debug for mglaquette (mirror mmime candidate check)
      if (__DEV__ && currentNameSlug.includes("mglaquette")) {
        console.log("[EVO MGBASIC] mglaquette - candidate check", {
          evoNameSlug,
          evoPokedexId: evo.pokedex_id,
          evoCondition: evo.condition,
          evoVariants: evoVariants.map((v) => ({ pokedex_id: v.pokedex_id, region: v.region, name: v.name?.fr })),
          isPre,
        });
      }

      // Also debug when current is mglaquette and we are checking an evolution
      if (__DEV__ && currentNameSlug === "mglaquette") {
        console.log("[EVO MGCTX] current mglaquette -> evolution candidate:", {
          evoNameSlug,
          evoVariants: evoVariants.map((v) => ({ pokedex_id: v.pokedex_id, region: v.region, name: v.name?.fr })),
          currentIsRegional,
          currentRegionName,
        });
      }

      // TYPE 2: Regional form evolves to different Pokémon than standard
      // The rule can exist in either regionalToNormal (regional -> standard)
      // or regionalToRegional (regional -> regional).
      const regionalSpecialRule = [...regionalEvolutions.regionalToNormal, ...regionalEvolutions.regionalToRegional].find((re) => {
        const matchesNames = isPre
          ? normalizeName(re.to) === currentNameSlug &&
            normalizeName(re.from) === evoNameSlug
          : normalizeName(re.from) === currentNameSlug &&
            normalizeName(re.to) === evoNameSlug;
        const matchesRegion = isPre
          ? re.toRegion === currentRegionName
          : re.fromRegion === currentRegionName;
        return matchesNames && matchesRegion;
      });


      // Check if this evolution is mentioned in any regional rule
      const hasAnyRegionalRule = [
        ...regionalEvolutions.normalToRegional,
        ...regionalEvolutions.regionalToNormal,
        ...regionalEvolutions.regionalToRegional,
      ].some((re) =>
        (normalizeName(re.from) === currentNameSlug || normalizeName(re.to) === currentNameSlug) ||
        (normalizeName(re.from) === evoNameSlug || normalizeName(re.to) === evoNameSlug)
      );

      // Apply TYPE 1 rule: Standard Pokémon can evolve to regional form
      if (standardToRegionalRule) {
        if (__DEV__ && currentNameSlug.includes("mglaquette")) {
          console.log("[EVO MGCTX-GLOBAL] standardToRegionalRule for mglaquette", { standardToRegionalRule, evoNameSlug });
        }
        if (__DEV__ && currentNameSlug.includes("mmime") && currentRegionName === "galar") {
          console.log("[EVO MMCTX-GALAR] standardToRegionalRule fired for mmime(galar)", { standardToRegionalRule, evoNameSlug });
        }
        // Show both standard AND regional evolution
        evoVariants.forEach((variant) => {
          filtered.push({
            pokedex_id: variant.pokedex_id,
            name: variant.name.fr,
            condition: evo.condition,
            region: variant.region,
          });
        });
        return;
      }

      // Apply TYPE 2 rule: Regional form evolves differently
      if (regionalSpecialRule) {
        if (__DEV__ && currentNameSlug.includes("mglaquette")) {
          console.log("[EVO MGCTX-GLOBAL] regionalSpecialRule matched for mglaquette", { regionalSpecialRule, evoNameSlug });
        }
        if (__DEV__ && currentNameSlug.includes("mmime") && currentRegionName === "galar") {
          console.log("[EVO MMCTX-GALAR] regionalSpecialRule matched for mmime(galar)", { regionalSpecialRule, evoNameSlug });
        }
        const targetRegion = isPre ? regionalSpecialRule.fromRegion : regionalSpecialRule.toRegion;
        const targetVariant = evoVariants.find((v) => (v.region ?? null) === targetRegion);
        
        if (targetVariant) {
          if (__DEV__ && currentNameSlug.includes("mglaquette")) {
            console.log("[EVO MGCTX-GLOBAL] regionalSpecial target resolved for mglaquette", { targetVariant });
          }
          if (__DEV__ && currentNameSlug.includes("mmime") && currentRegionName === "galar") {
            console.log("[EVO MMCTX-GALAR] regionalSpecial target resolved for mmime(galar)", { targetVariant });
          }
          if (__DEV__ && evoNameSlug === "mglaquette") {
            console.log("[EVO MG] regionalSpecial targetVariant", { targetVariant, targetRegion });
          }
          if (__DEV__) {
            const spriteFromEntry = targetVariant?.sprites?.regular ?? null;
            const artworkUrl = getPokemonArtwork(targetVariant.pokedex_id, targetVariant.region ?? null);
          }
          filtered.push({
            ...evo,
            name: targetVariant.name.fr,
            region: targetVariant.region,
            condition: evo.condition,
          });
        }
        return;
      }


      // If there's a regional rule but it doesn't match current region, skip this evolution
      if (hasAnyRegionalRule && currentIsRegional) {
        const relatedRules = [
          ...regionalEvolutions.normalToRegional,
          ...regionalEvolutions.regionalToNormal,
          ...regionalEvolutions.regionalToRegional,
        ].filter((re) => {
          const fromMatches = normalizeName(re.from) === currentNameSlug || normalizeName(re.from) === evoNameSlug;
          const toMatches = normalizeName(re.to) === currentNameSlug || normalizeName(re.to) === evoNameSlug;
          return fromMatches || toMatches;
        });

        const hasRuleForCurrentRegion = relatedRules.some((re) => {
            const fromRegionMatches = 'fromRegion' in re && (re as any).fromRegion === currentRegionName;
            const toRegionMatches = 'toRegion' in re && (re as any).toRegion === currentRegionName;
            const regionMatches = 'region' in re && (re as any).region === currentRegionName;
            return fromRegionMatches || toRegionMatches || regionMatches;
        });


        if (!hasRuleForCurrentRegion) {
          // This regional form has a special rule that doesn't apply here
          return;
        }
      }

      // Default regional logic
      if (currentIsRegional) {
        // Pour un Pokémon régional, chercher uniquement la variante régionale
        const regionalMatch = evoVariants.find(
          (v) => (v.region ?? null) === currentRegionName
        );
        const standardMatch = evoVariants.find((v) => (v.region ?? null) === null);

        if (regionalMatch) {
          // Si une variante régionale existe, l'afficher uniquement
          filtered.push({
            ...evo,
            name: regionalMatch.name.fr,
            region: regionalMatch.region,
            condition: evo.condition,
          });
        } else if (standardMatch) {
          // Sinon, afficher la variante standard (fallback)
          filtered.push({
            ...evo,
            name: standardMatch.name.fr,
            region: null,
            condition: evo.condition,
          });
        }
      } else {
        // Pour un Pokémon standard : afficher uniquement la variante standard
        // Mais vérifier qu'il n'y a pas d'évolution exclusive à une forme régionale
        // Consider evolution exclusive to regional forms only if:
        // - a rule exists that maps a regional form to this evolution, AND
        // - there is no standard variant available in entries
           const hasStandardVariant = evoVariants.some((v) => (v.region ?? null) === null);

        const isTargetMentionedInRegionalRules = [
          ...regionalEvolutions.normalToRegional,
          ...regionalEvolutions.regionalToNormal,
          ...regionalEvolutions.regionalToRegional,
        ].some((re) => normalizeName(re.to) === evoNameSlug);

        // If there's a rule that says a regional form evolves to this target (fromRegion != null)
        // and the current Pokémon is the standard form, then we must not show this evolution.
        const relatedRulesForTarget = [
          ...regionalEvolutions.normalToRegional,
          ...regionalEvolutions.regionalToNormal,
          ...regionalEvolutions.regionalToRegional,
        ].filter((re) => normalizeName(re.from) === currentNameSlug || normalizeName(re.to) === currentNameSlug || normalizeName(re.from) === evoNameSlug || normalizeName(re.to) === evoNameSlug);

        const requiresRegionalFrom = relatedRulesForTarget.some((re) => ('fromRegion' in re) && (re as any).fromRegion !== null && normalizeName(re.from) === currentNameSlug);

        if (requiresRegionalFrom && !currentIsRegional) {
          // This evolution only applies to a regional form of the current Pokémon
          // and the current form is standard -> hide it.
          return;
        }

        const isExclusiveToRegional = isTargetMentionedInRegionalRules && !hasStandardVariant;

        if (isExclusiveToRegional) {
          // Cette évolution est exclusive à une forme régionale, ne pas l'afficher
          return;
        }

        const standardMatch = evoVariants.find((v) => (v.region ?? null) === null);
        
        if (standardMatch) {
          filtered.push({
            pokedex_id: standardMatch.pokedex_id,
            name: standardMatch.name.fr,
            condition: evo.condition,
            region: null,
          });
        } else {
          // Fallback
          const firstVariant = evoVariants[0];
          if (firstVariant) {
            filtered.push({
              pokedex_id: firstVariant.pokedex_id,
              name: firstVariant.name.fr,
              condition: evo.condition,
              region: firstVariant.region,
            });
          }
        }
      }
    });

    return filtered;
  };

  // Determine which evolutions to display and filter by region
  let preRaw =
    chainPre && chainPre.length > 0 ? chainPre : displayedEvolution?.pre ?? [];
  const nextRaw =
    chainNext && chainNext.length > 0
      ? chainNext
      : displayedEvolution?.next ?? [];

  // Pour les stages 3, ne garder que la dernière pré-évolution (la directe)
  // displayedEvolution?.pre contient toute la chaîne [Pichu, Pikachu]
  // mais on veut seulement [Pikachu] pour Raichu
  if (chainStageNumber === 3 && Array.isArray(preRaw) && preRaw.length > 1) {
    preRaw = [preRaw[preRaw.length - 1]]; // Garder seulement le dernier (le plus proche)
  }

  const preFinal = filterEvolutionsByRegion(
    Array.isArray(preRaw) ? preRaw : [],
    true // isPre = true pour les pré-évolutions
  );
  const nextFinal = filterEvolutionsByRegion(
    Array.isArray(nextRaw) ? nextRaw : [],
    false // isPre = false pour les évolutions suivantes
  );

  // Fix: if a regional rule maps current regional -> target, but the API
  // erroneously lists the target in preFinal, move it to nextFinal.
  // This handles cases like M. Mime de Galar -> M. Glaquette when the server
  // returned M. Glaquette in pre instead of next.
  if (__DEV__) {
    // Only run for regional forms
    const maybeMoveFromPreToNext = (curSlug: string, curRegion: string | null) => {
      const forwardRules = [
        ...regionalEvolutions.regionalToNormal,
        ...regionalEvolutions.regionalToRegional,
      ].filter((r) => normalizeName(r.from) === curSlug && (r.fromRegion ?? null) === curRegion);

      if (forwardRules.length === 0) return; // none to check

      forwardRules.forEach((r) => {
        const targetSlug = normalizeName(r.to);
        const preIndex = preFinal.findIndex((p) => normalizeName(p.name) === targetSlug);
        if (preIndex >= 0) {
          const moved = preFinal.splice(preIndex, 1)[0];
          // adjust region if rule indicates a target region
          moved.region = r.toRegion ?? moved.region;
          nextFinal.push(moved);
          console.log("[EVO FIX] Moved evolution from pre->next due to regional rule", { from: r.from, fromRegion: r.fromRegion, to: r.to, toRegion: r.toRegion, moved });
        }
      });
    };

    // Get the current slug and region from the entries (repeat minimal logic used above)
    const currentPokemon = entries.find((e) => e.pokedex_id === currentPokedexId && e.region === currentRegion) || entries.find((e) => e.pokedex_id === currentPokedexId);
    if (currentPokemon) {
      const currentSlug = normalizeName(currentPokemon.nameSlug || currentPokemon.name.fr);
      maybeMoveFromPreToNext(currentSlug, currentPokemon.region ?? null);

      // Ensure forward regional rules create a next evolution if it's missing
      // This handles cases where the API erroneously listed the rule target in `pre` or omitted it entirely
      const forwardRulesEnsure = [
        ...regionalEvolutions.regionalToNormal,
        ...regionalEvolutions.regionalToRegional,
      ].filter((r) => normalizeName(r.from) === currentSlug && (r.fromRegion ?? null) === (currentPokemon.region ?? null));

      forwardRulesEnsure.forEach((r) => {
        const targetSlug = normalizeName(r.to);
        const alreadyInNext = nextFinal.some((n) => normalizeName(n.name) === targetSlug);
        if (alreadyInNext) return; // nothing to inject

        // Try to find a matching variant in entries (correct pokedex_id and region)
        const targetVariant = entries.find((v) => {
          // normalize variant slug the same way
          const vSlug = normalizeName(v.name?.fr);
          const regionMatch = (r.toRegion ?? null) === (v.region ?? null);
          return vSlug === targetSlug && regionMatch;
        });

        if (targetVariant) {
          nextFinal.push({
            pokedex_id: targetVariant.pokedex_id,
            name: targetVariant.name.fr,
            condition: r.condition ?? undefined,
            region: targetVariant.region,
          });

          if (__DEV__) {
            console.log("[EVO ADD] Added forward target from regional rule", { from: r.from, fromRegion: r.fromRegion, to: r.to, toRegion: r.toRegion, targetVariant });
          }
          return;
        }

        // Fallback: inject a synthetic entry so the UI still shows something while debugging
        nextFinal.push({
          pokedex_id: -1,
          name: r.to_name_fr ?? r.to ?? "?",
          condition: r.condition ?? undefined,
          region: r.toRegion ?? null,
        });

        if (__DEV__) {
          console.log("[EVO ADD] Synthetic next added for missing target", { rule: r });
        }
      });
    }
  }

  // Log sprites used by the UI for each evolution (helps verify we show correct artwork)
  if (__DEV__) {
    const spriteLog = (label: string, list: EvolutionEntry[]) => {
      const data = list.map((e) => {
        const entryVariant = entries.find((v) => v.pokedex_id === e.pokedex_id && (v.region ?? null) === (e.region ?? null));
        const spriteFromEntry = entryVariant?.sprites?.regular ?? null;
        const artworkUrl = getPokemonArtwork(e.pokedex_id, e.region ?? null);
        return {
          pokedex_id: e.pokedex_id,
          name: e.name,
          region: e.region ?? null,
          spriteFromEntry,
          computedArtwork: artworkUrl,
        };
      });
    };

    spriteLog("preFinal", preFinal);
    spriteLog("nextFinal", nextFinal);
  }

  const preCount = preFinal.length;
  const nextCount = nextFinal.length;

  // No evolutions at all
  if (preCount === 0 && nextCount === 0) {
    return (
      <ThemedText style={{ textAlign: "center", color: colors.grayMedium }}>
        Pas d'évolution
      </ThemedText>
    );
  }

  // Stage 2 with next evolutions: show pre on left, separator, next on right
  // Stage 2 without next evolutions (final form): behave like stage 3
  if (chainStageNumber === 2 && nextCount > 0) {
    return (
      <Row style={{ alignSelf: "stretch", gap: 8 }}>
        <View style={{ flex: 1, gap: 8 }}>
          {preCount > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 4,
                alignItems: "flex-end",
                ...(preCount === 1
                  ? { flexGrow: 1, justifyContent: "center" }
                  : {}),
              }}
            >
              <Row gap={8}>
                {preFinal.map((p) => (
                  <PokemonEvo
                    key={`pre-${p.pokedex_id}-${p.region || "standard"}`}
                    pokedex_id={p.pokedex_id}
                    name={p.name}
                    condition={p.condition}
                    region={p.region}
                    onPress={() => onNavigate(p.pokedex_id, p.region)}
                  />
                ))}
              </Row>
            </ScrollView>
          )}
        </View>

        <View
          style={{
            width: 1,
            marginHorizontal: 4,
            alignSelf: "center",
            height: 52,
          }}
        >
          <View
            style={{
              width: 1,
              height: 64,
              backgroundColor: colorType,
              borderRadius: 1,
              alignSelf: "center",
            }}
          />
        </View>

        <View style={{ flex: 1, gap: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 4,
              alignItems: "flex-start",
              ...(nextCount === 1
                ? { flexGrow: 1, justifyContent: "center" }
                : {}),
            }}
          >
            <Row gap={8}>
              {nextFinal.map((n) => (
                <PokemonEvo
                  key={`next-${n.pokedex_id}-${n.region || "standard"}`}
                  pokedex_id={n.pokedex_id}
                  name={n.name}
                  condition={n.condition}
                  region={n.region}
                  onPress={() => onNavigate(n.pokedex_id, n.region)}
                />
              ))}
            </Row>
          </ScrollView>
        </View>
      </Row>
    );
  }

  // Stage 1: show only next (stage 2)
  // Stage 2 without next (final): show only pre (stage 1)
  // Stage 3: show only pre (stage 2)
  const evolutionsToShow = chainStageNumber === 1 ? nextFinal : preFinal;

  return (
    <View style={{ alignSelf: "stretch" }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 4,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <Row gap={8}>
          {evolutionsToShow.map((evo) => (
            <PokemonEvo
              key={`evo-${evo.pokedex_id}-${evo.region || "standard"}`}
              pokedex_id={evo.pokedex_id}
              name={evo.name}
              condition={evo.condition}
              region={evo.region}
              onPress={() => onNavigate(evo.pokedex_id, evo.region)}
            />
          ))}
        </Row>
      </ScrollView>
    </View>
  );
}
