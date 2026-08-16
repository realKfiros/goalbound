import { CLUBS, SCENARIOS, clubByName, country } from "./catalog";
import { clubDivision, maxSingleFee } from "./finances";
import { simulateHonoursWithWorld } from "./honours";
import { generateName } from "./names";
import { clubInWorld, createWorldState } from "./world";
import type {
  CareerBeat,
  CareerDecision,
  CareerDraft,
  CareerStart,
  Club,
  Offer,
  OfferKind,
  Player,
  Role,
  Scenario,
  ScenarioOption,
  ScenarioResolution,
  Season,
  SeasonSimulation,
  WorldState,
} from "./domain";

const ROLE_SCORE: Record<Role, number> = { Prospect: 1, Rotation: 2, Starter: 3, Star: 4 };

export function createCareerEngine(random = Math.random) {
  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }
  function randomInt(min: number, max: number) {
    return Math.floor(random() * (max - min + 1)) + min;
  }
  function shuffle<T>(items: T[]) {
    return [...items].sort(() => random() - .5);
  }
  function roleFor(rating: number, clubLevel: number, age: number, boost = 0): Role {
    const required = 49 + clubLevel * 8;
    const score = rating + boost * 4;
    if (age <= 17 && clubLevel >= 4) return "Prospect";
    if (score >= required + 8) return "Star";
    if (score >= required) return "Starter";
    if (score >= required - 7) return "Rotation";
    return "Prospect";
  }
  function marketValue(rating: number, age: number, potential: number) {
    const ageFactor = age <= 21 ? 1.2 : age <= 27 ? 1 : age <= 30 ? .82 : age <= 33 ? .55 : .28;
    const potentialFactor = age < 24 ? 1 + Math.max(0, potential - rating) / 35 : 1;
    return Math.round(Math.max(80_000, (rating - 45) ** 3 * 430 * ageFactor * potentialFactor));
  }
  function formatMoney(value: number) {
    return value >= 1_000_000 ? `€${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m` : `€${Math.round(value / 1_000)}k`;
  }
  function isPlausibleMarketClub(club: Club, player: Player, world?: WorldState | null) {
    if (clubDivision(club) === 1) return true;
    const catalogCurrent = clubByName(player.currentClub);
    const current = catalogCurrent ? clubInWorld(catalogCurrent, world) : undefined;
    return club.country === player.nation || club.country === current?.country;
  }
  function offerReason(club: Club, player: Player, role: Role, world?: WorldState | null) {
    const catalogCurrent = clubByName(player.currentClub);
    const current = catalogCurrent ? clubInWorld(catalogCurrent, world) : undefined;
    const isHomecoming = current && current.country !== player.nation && club.country === player.nation;
    if (isHomecoming) return "A homecoming with a clearer route to senior minutes";
    if (player.age >= 32) return "One last adventure, one serious contract";
    const steppingStones = ["POR", "NED", "BEL", "CRO"];
    const establishedLeagues = ["ENG", "ESP", "GER", "ITA", "FRA"];
    const isTopFlightStep = clubDivision(club) === 1 && steppingStones.includes(club.country) && current?.country !== club.country;
    if (isTopFlightStep && current && !establishedLeagues.includes(current.country)) return "A proven bridge to a bigger league";
    if (isTopFlightStep && current && establishedLeagues.includes(current.country)) return "A top-flight reset with a clearer route to minutes";
    if (role === "Prospect") return "Prestige now, patience required";
    if (role === "Star") return "The team is being built around you";
    return `${club.development}/5 development · a credible next step`;
  }
  function makeOffer(club: Club, player: Player, label: string, kind: OfferKind, role?: Role, reason?: string, world?: WorldState | null): Offer {
    const resolvedRole = role ?? roleFor(player.rating, club.level, player.age, player.roleBoost);
    return { ...club, role: resolvedRole, label, reason: reason ?? offerReason(club, player, resolvedRole, world), kind };
  }
  function firstOffers(player: Player): Offer[] {
    const domestic = CLUBS.filter((club) => club.country === player.nation);
    if (player.origin === "academy") {
      const grounded = domestic.filter((club) => club.level <= 3);
      const elite = domestic.filter((club) => club.level >= 4);
      const preferred = grounded.length ? grounded : domestic;
      const fallback = domestic.filter((club) => !preferred.includes(club));
      let pool = [...shuffle(preferred), ...shuffle(fallback)].slice(0, 3);
      if (grounded.length >= 3 && elite.length && random() < .12) {
        pool = [...pool.slice(0, 2), shuffle(elite)[0]];
      }
      return shuffle(pool).slice(0, 3).map((club) => makeOffer(club, player, "Academy place", "academy", "Prospect", `${club.development}/5 development · a patient route into football`));
    }
    const maxLevel = player.origin === "gem" ? 5 : 3;
    const eligible = domestic.filter((club) => club.level <= maxLevel);
    const fallback = domestic.filter((club) => !eligible.includes(club));
    return [...shuffle(eligible), ...shuffle(fallback)].slice(0, 3).map((club) => {
      const role = roleFor(player.rating, club.level, player.age, player.origin === "gem" ? 1 : 0);
      return makeOffer(club, player, player.origin === "gem" && club.level >= 4 ? "First-team fast track" : "Senior contract", "permanent", role, player.origin === "gem" ? `${role} role · the scouts believe the hype` : `${role} role · senior football immediately`);
    });
  }
  function externalOffers(player: Player, count = 2, permanentOnly = false, requiresTransferFee = false, world?: WorldState | null): Offer[] {
    const ideal = player.rating >= 87 ? 5 : player.rating >= 80 ? 4 : player.rating >= 72 ? 3 : player.rating >= 64 ? 2 : 1;
    const minimumFee = player.value * .92;
    const market = CLUBS.map((club) => clubInWorld(club, world)).filter((club) => {
      const role = roleFor(player.rating, club.level, player.age, player.roleBoost);
      return club.name !== player.currentClub
        && isPlausibleMarketClub(club, player, world)
        && (!requiresTransferFee || maxSingleFee(club, role) >= minimumFee);
    });
    let pool = market.filter((club) => Math.abs(club.level - ideal) <= (player.agent.includes("International") ? 2 : 1));
    if (player.age < 18) {
      pool = market.filter((club) => club.country === player.nation);
    } else if (player.age <= 21) {
      const hubs = new Set([player.nation, "POR", "NED", "BEL", "GER", "FRA"]);
      pool = pool.filter((club) => hubs.has(club.country) || club.development >= 5);
    }
    if (player.age >= 31) {
      const lateMarkets = new Set([player.nation, "USA", "SAU", "JPN", "MEX", "BRA", "ARG", "TUR"]);
      pool = pool.filter((club) => lateMarkets.has(club.country) || club.level >= 4);
    }
    if (!pool.length) pool = market.filter((club) => Math.abs(club.level - ideal) <= 2);
    return shuffle(pool).slice(0, count).map((club) => {
      const role = roleFor(player.rating, club.level, player.age, player.roleBoost);
      const loan = !permanentOnly && player.age <= 22 && role === "Prospect" && random() < .55;
      const catalogCurrent = clubByName(player.currentClub);
      const current = catalogCurrent ? clubInWorld(catalogCurrent, world) : undefined;
      const label = club.country === current?.country ? "Domestic move" : club.country === player.nation ? "Homecoming" : player.age >= 31 ? "Final adventure" : "Move abroad";
      return makeOffer(club, player, loan ? "Loan proposal" : label, loan ? "loan" : "permanent", loan ? "Starter" : role, undefined, world);
    });
  }
  function permanentOffers(player: Player, count = 2, requiresTransferFee = false, world?: WorldState | null): Offer[] {
    return externalOffers(player, count, true, requiresTransferFee, world);
  }
  function contractedBids(player: Player, count = 2, world?: WorldState | null): Offer[] {
    return permanentOffers(player, count, true, world).map((offer) => {
      const rounding = clubDivision(offer) <= 2 ? 50_000 : 10_000;
      const proposedFee = Math.round(player.value * (randomInt(92, 128) / 100) / rounding) * rounding;
      const fee = Math.min(proposedFee, maxSingleFee(offer, offer.role));
      return makeOffer(offer, player, "Accepted transfer bid", "permanent", offer.role, `${offer.name} agreed ${formatMoney(fee)} with ${player.currentClub} · proposed ${offer.role.toLowerCase()} role`);
    });
  }
  function stayOffer(player: Player, kind: "stay" | "renewal" | "promotion" = "stay", world?: WorldState | null): Offer | null {
    const catalogClub = clubByName(player.currentClub);
    if (!catalogClub) return null;
    const club = clubInWorld(catalogClub, world);
    const role = player.squad === "academy" && kind === "stay" ? "Prospect" : roleFor(player.rating, club.level, player.age, player.roleBoost + (kind === "promotion" ? 0 : 1));
    const copy = kind === "renewal"
      ? { label: "Renew contract", reason: "A new 3–5 year deal · keep building in familiar colours" }
      : kind === "promotion"
        ? { label: "Join the senior squad", reason: role === "Prospect" ? "Train with the first team and wait for minutes" : `The manager sees you as ${role.toLowerCase()}` }
        : { label: `Stay at ${club.name}`, reason: role === "Prospect" ? "Fight for a place without uprooting your life" : "Continuity, trust and unfinished business" };
    return makeOffer(club, player, copy.label, kind, role, copy.reason);
  }
  function eligibleScenario(player: Player) {
    const available = SCENARIOS.filter((item) => !player.seenScenarios.includes(item.id) && (!item.minAge || player.age >= item.minAge) && (!item.maxAge || player.age <= item.maxAge) && (!item.needsCaps || player.caps > 0));
    const fallback = SCENARIOS.filter((item) => (!item.minAge || player.age >= item.minAge) && (!item.maxAge || player.age <= item.maxAge));
    return shuffle(available.length ? available : fallback)[0];
  }
  function positionRates(position: string, rating: number) {
    const quality = clamp((rating - 55) / 45, 0, 1);
    if (position === "ST") return { goals: .22 + quality * .42, assists: .08 + quality * .12 };
    if (["LW", "RW"].includes(position)) return { goals: .12 + quality * .28, assists: .13 + quality * .2 };
    if (position === "CAM") return { goals: .08 + quality * .2, assists: .16 + quality * .25 };
    if (["CM", "CDM"].includes(position)) return { goals: .03 + quality * .1, assists: .08 + quality * .17 };
    if (["LB", "RB"].includes(position)) return { goals: .01 + quality * .04, assists: .06 + quality * .13 };
    if (position === "CB") return { goals: .02 + quality * .04, assists: .01 + quality * .03 };
    return { goals: 0, assists: .01 };
  }
  function seasonNarrative(role: Role, apps: number, movedAbroad: boolean, injured: boolean, honourKinds: string[]) {
    if (honourKinds.includes("ballon-dor")) return "You won the Ballon d'Or. The group chat becomes briefly respectful.";
    if (honourKinds.includes("player-of-season") || honourKinds.includes("golden-boot")) return "You collected an individual award. Your agent has already made it their profile photo.";
    if (honourKinds.includes("league-title") || honourKinds.includes("national-cup")) return "You lifted silverware. Nobody remembers the November draw anymore.";
    if (injured) return "The season had momentum. Your hamstring preferred a different narrative.";
    if (apps < 15) return "Your most consistent position was next to the assistant coach.";
    if (role === "Star") return "The manager finally built around you. Subtlety was not required.";
    if (movedAbroad) return "You settled abroad and learned the language—especially the useful words referees dislike.";
    if (role === "Starter") return "The team sheet stopped being a source of suspense. Progress.";
    return "A useful season: enough football to grow, enough bench time to stay humble.";
  }
  function decision(kind: CareerDecision["kind"], title: string, description: string, offers: Offer[]): CareerDecision {
    return { type: "decision", kind, title, description, offers };
  }

  function createCareer(draft: CareerDraft): CareerStart {
    const roll = random();
    const origin = roll < .07 ? "gem" : roll < .23 ? "senior" : "academy";
    const age = origin === "academy" ? 16 : 17;
    const rating = origin === "gem" ? randomInt(67, 72) : origin === "senior" ? randomInt(58, 64) : randomInt(48, 56);
    const potential = origin === "gem" ? randomInt(90, 96) : origin === "senior" ? randomInt(79, 91) : randomInt(76, 93);
    const player: Player = {
      ...draft, name: draft.name.trim() || generateName(draft.nation, random), age, rating, potential,
      value: marketValue(rating, age, potential), currentClub: "Free agent", parentClub: null,
      totalApps: 0, totalGoals: 0, totalAssists: 0, trophies: 0, caps: 0, nationalGoals: 0,
      morale: origin === "gem" ? 84 : 72, fitness: 92, reputation: origin === "gem" ? 24 : origin === "senior" ? 13 : 6,
      agent: "Self-represented", roleBoost: origin === "gem" ? 1 : 0, origin,
      squad: origin === "academy" ? "academy" : "senior", contractYears: 0, clubSeasons: 0,
      lastRole: "Prospect", seenScenarios: [], history: [],
    };
    const title = origin === "gem" ? "The scouts think they have found a gem" : origin === "senior" ? "A senior coach is willing to take the risk" : "Your first route runs through the academy system";
    const description = origin === "gem"
      ? `Only 7% of careers begin here. You start at ${rating} OVR and clubs are discussing the senior squad, not the youth bus.`
      : origin === "senior"
        ? `You begin at ${rating} OVR. No glamorous academy photo: a smaller first team needs a footballer now.`
        : `You begin at ${rating} OVR. The elite academies may call, but most careers start somewhere less photogenic.`;
    return { player, offers: firstOffers(player), title, description };
  }

  function simulateSeason(player: Player, offer: Offer, requestedYears: number, existingWorld?: WorldState | null): SeasonSimulation {
    const startingWorld = existingWorld ?? createWorldState();
    const destination = { ...offer, ...clubInWorld(offer, startingWorld), role: offer.role, label: offer.label, reason: offer.reason, kind: offer.kind };
    const years = Math.min(requestedYears, 36 - player.age);
    const roleScore = clamp(ROLE_SCORE[destination.role] + player.roleBoost, 1, 4);
    const perYearApps = roleScore === 1 ? randomInt(4, 15) : roleScore === 2 ? randomInt(16, 29) : roleScore === 3 ? randomInt(28, 42) : randomInt(36, 48);
    const injuryChance = clamp(.08 + (100 - player.fitness) / 240 + Math.max(0, player.age - 30) / 80, .07, .38);
    const injured = random() < injuryChance;
    const apps = Math.max(2, Math.round(perYearApps * years * (injured ? randomInt(45, 72) / 100 : 1)));
    const rates = positionRates(player.position, player.rating);
    const goals = Math.max(0, Math.round(apps * rates.goals * randomInt(75, 125) / 100));
    const assists = Math.max(0, Math.round(apps * rates.assists * randomInt(75, 125) / 100));
    const ageBase = player.age < 19 ? 5 : player.age < 22 ? 4 : player.age < 26 ? 2 : player.age < 29 ? 1 : player.age < 32 ? 0 : -2;
    const positionAgeAdjustment = player.position === "GK" ? (player.age < 21 ? -2 : player.age >= 29 ? 1 : 0) : ["CB", "CDM"].includes(player.position) && player.age >= 29 ? 1 : 0;
    const minutesBonus = apps / years >= 28 ? 2 : apps / years >= 16 ? 0 : -2;
    const rawGrowth = Math.round((ageBase + positionAgeAdjustment + Math.floor(destination.development / 2) + minutesBonus + player.morale / 50 - (injured ? 2 : 0)) * Math.sqrt(years) / 1.8);
    const nextRating = clamp(Math.min(player.potential, player.rating + rawGrowth), 45, 96);
    const honoursSimulation = simulateHonoursWithWorld({
      player, offer: destination, years, apps, goals, assists, rating: nextRating, reputation: player.reputation,
    }, startingWorld, random);
    const honours = honoursSimulation.honours;
    const playerHonours = honours.flatMap((annual) => annual.playerHonours);
    const trophies = playerHonours.filter((honour) => honour.category === "team").length;
    const individualAwards = playerHonours.filter((honour) => honour.category === "individual").length;
    const threshold = country(player.nation).threshold;
    const caps = nextRating >= threshold || nextRating >= threshold - 3 && player.reputation >= 55 ? years * randomInt(2, 8) : 0;
    const nationalGoals = Math.round(caps * positionRates(player.position, nextRating).goals * .65);
    const season: Season = {
      fromAge: player.age, toAge: player.age + years, club: destination.name, country: destination.country, league: destination.league,
      role: destination.role, kind: destination.kind, apps, goals, assists, before: player.rating, after: nextRating, trophies,
      event: seasonNarrative(destination.role, apps, destination.country !== player.nation, injured, playerHonours.map((honour) => honour.kind)),
      honours,
    };
    const contractAtKickoff = destination.kind === "renewal" ? randomInt(3, 5)
      : destination.kind === "academy" ? randomInt(3, 4)
        : destination.kind === "promotion" ? Math.max(player.contractYears, randomInt(2, 4))
          : destination.kind === "permanent" ? randomInt(2, 5)
            : player.contractYears;
    const next: Player = {
      ...player, age: player.age + years, rating: nextRating, value: marketValue(nextRating, player.age + years, player.potential),
      currentClub: destination.kind === "loan" ? player.currentClub : destination.name, parentClub: null,
      totalApps: player.totalApps + apps, totalGoals: player.totalGoals + goals, totalAssists: player.totalAssists + assists,
      trophies: player.trophies + trophies, caps: player.caps + caps, nationalGoals: player.nationalGoals + nationalGoals,
      morale: clamp(player.morale + (apps / years >= 25 ? 6 : -8) + trophies * 8 + individualAwards * 4, 20, 100),
      fitness: clamp(player.fitness + (injured ? -22 : 5) - Math.max(0, player.age - 31), 25, 100),
      reputation: clamp(player.reputation + Math.round(apps / years / 7) + trophies * 6 + individualAwards * 5, 0, 100),
      roleBoost: 0, squad: destination.kind === "academy" || destination.kind === "stay" && player.squad === "academy" ? "academy" : "senior",
      contractYears: Math.max(0, contractAtKickoff - years),
      clubSeasons: destination.name === player.currentClub || destination.kind === "loan" ? player.clubSeasons + years : years,
      lastRole: destination.role, history: [season, ...player.history],
    };
    return { player: next, season, world: honoursSimulation.world };
  }

  function ordinaryDecision(player: Player, world?: WorldState | null): CareerDecision {
    const stay = stayOffer(player, "stay", world);
    const latest = player.history[0];
    const seasons = Math.max(1, (latest?.toAge ?? player.age) - (latest?.fromAge ?? player.age - 1));
    const formBonus = (latest?.apps ?? 0) / seasons >= 25 ? .12 : player.lastRole === "Star" ? .1 : 0;
    const interestChance = clamp(.18 + player.reputation / 170 + formBonus, .18, .74);
    const outsideInterest = player.squad === "academy" || random() >= interestChance ? [] : contractedBids(player, random() < .72 ? 1 : 2, world);
    return decision(
      outsideInterest.length ? "transfer-interest" : "continue",
      outsideInterest.length ? "Transfer bids have arrived while you are under contract" : `What should the next chapter at ${player.currentClub} look like?`,
      outsideInterest.length ? `${player.currentClub} has agreed a fee, but your ${player.contractYears}-year contract does not force you to leave. Stay, or accept one of the approaches.` : "No artificial transfer window this time. The club expects you back, and staying is a complete career choice.",
      [...(stay ? [stay] : []), ...outsideInterest],
    );
  }

  function nextBeat(player: Player, latest: Season | null, world?: WorldState | null): CareerBeat {
    if (player.age >= 36) return { type: "summary" };
    const catalogCurrent = clubByName(player.currentClub);
    const current = catalogCurrent ? clubInWorld(catalogCurrent, world) : undefined;
    if (player.squad === "academy" && player.age >= 18) {
      const promotion = stayOffer(player, "promotion", world);
      const notRetained = player.rating < 59 && random() < .32;
      const offers = [...(!notRetained && promotion ? [promotion] : []), ...(notRetained ? permanentOffers(player, 3, false, world) : externalOffers(player, 2, false, false, world))];
      return decision(notRetained ? "released" : "graduation", notRetained ? `${player.currentClub} will not offer senior terms` : "Academy graduation day has arrived", notRetained ? "The development report uses the phrase ‘different pathway’. Your access card stops working on Monday." : "The youth-team shirt is finished. You can join the senior queue, take a loan, or leave before becoming training-cone furniture.", offers);
    }
    if (player.squad === "academy") return random() < .46 ? { type: "scenario", scenario: eligibleScenario(player) } : ordinaryDecision(player, world);
    if (latest?.kind === "loan") {
      const returning = stayOffer(player, "stay", world);
      return decision("loan-return", `The loan is over. ${player.currentClub} wants an answer.`, "The parent club says it watched every minute. Your agent says that sentence was delivered while someone searched for your name.", [...(returning ? [returning] : []), ...externalOffers(player, 2, false, false, world)]);
    }
    if (player.contractYears <= 0) {
      const seasons = Math.max(1, (latest?.toAge ?? player.age) - (latest?.fromAge ?? player.age - 1));
      const useful = (latest?.apps ?? 0) / seasons >= 14 || player.lastRole === "Star" || player.lastRole === "Starter";
      const rejected = !useful && random() < .62 || player.age >= 34 && random() < .28;
      const renewal = rejected ? null : stayOffer(player, "renewal", world);
      return decision(rejected ? "released" : "contract", rejected ? `${player.currentClub} will not renew your contract` : `${player.currentClub} has offered a new contract`, rejected ? "The sporting director thanks you for your service, then asks security whether the meeting room is needed at eleven." : `You can stay beyond ${player.clubSeasons} seasons at the club, or listen to the market.`, [...(renewal ? [renewal] : []), ...permanentOffers(player, rejected ? 3 : 2, false, world)]);
    }
    const forcedSaleChance = current && current.level <= 2 && player.rating >= 72 ? .2 : player.value >= 35_000_000 && current && current.level <= 3 ? .14 : .045;
    if (random() < forcedSaleChance) {
      return decision("forced-sale", `${player.currentClub} has accepted that you must be sold`, current && current.level <= 2 ? "Your value is now larger than several items on the club balance sheet. The board calls the sale ‘strategic’." : "The accounts need help. The board has discovered that loyalty does not appear as cash on the annual report.", permanentOffers(player, 3, true, world));
    }
    const seasons = Math.max(1, (latest?.toAge ?? player.age) - (latest?.fromAge ?? player.age - 1));
    if ((latest?.apps ?? 99) / seasons < 12 && player.age >= 20 && random() < .42) {
      return decision("released", `${player.currentClub} no longer sees a role for you`, "The manager says this is purely professional, which is football language for ‘please choose one of these exits’.", permanentOffers(player, 3, false, world));
    }
    return random() < .54 ? { type: "scenario", scenario: eligibleScenario(player) } : ordinaryDecision(player, world);
  }

  function resolveScenario(player: Player, scenario: Scenario, option: ScenarioOption): ScenarioResolution {
    const roll = random();
    let cursor = 0;
    const result = option.outcomes.find((item) => { cursor += item.probability; return roll <= cursor; }) ?? option.outcomes[option.outcomes.length - 1];
    const effect = result.effect;
    const rating = clamp(player.rating + (effect.rating ?? 0), 45, player.potential);
    return {
      player: {
        ...player, rating,
        value: Math.round(marketValue(rating, player.age, player.potential) * (effect.value ?? 1)),
        morale: clamp(player.morale + (effect.morale ?? 0), 0, 100),
        fitness: clamp(player.fitness + (effect.fitness ?? 0), 0, 100),
        reputation: clamp(player.reputation + (effect.reputation ?? 0), 0, 100),
        roleBoost: clamp(player.roleBoost + (effect.roleBoost ?? 0), -2, 2),
        agent: effect.agent ?? player.agent,
        seenScenarios: [...player.seenScenarios, scenario.id],
      },
      outcome: { label: result.label, positive: result.positive },
    };
  }

  function achievements(player: Player) {
    const list: string[] = player.history.length ? ["Professional debut"] : [];
    const honours = player.history.flatMap((season) => (season.honours ?? []).flatMap((annual) => annual.playerHonours));
    if (new Set(player.history.map((season) => season.country)).size >= 3) list.push("Three-country career");
    if (player.totalApps >= 100) list.push("Century of appearances");
    if (player.totalGoals >= 100) list.push("Hundred-goal club");
    if (player.trophies >= 3) list.push("Serial winner");
    if (player.caps >= 25) list.push("International regular");
    if (player.rating >= 88) list.push("World class");
    if (honours.some((honour) => honour.kind === "player-of-season")) list.push("Player of the season");
    if (honours.some((honour) => honour.kind === "ballon-dor")) list.push("Ballon d'Or winner");
    return list;
  }

  return { createCareer, simulateSeason, ordinaryDecision, nextBeat, resolveScenario, achievements };
}

export const careerEngine = createCareerEngine();
