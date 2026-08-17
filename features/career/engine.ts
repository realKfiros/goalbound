import { CLUBS, SCENARIOS, clubByName, country } from "./catalog";
import { DEVELOPMENT_MARKETS, VETERAN_MARKETS, agentProfile } from "./agents";
import { clubDivision, maxSingleFee } from "./finances";
import { simulateHonoursWithWorld } from "./honours";
import { generateName } from "./names";
import { clubInWorld, clubSeasonState, createWorldState } from "./world";
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
type BidContext = "standard" | "forced-sale" | "player-request";

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
  function currentClubFor(player: Player, world?: WorldState | null) {
    const catalogCurrent = clubByName(player.currentClub);
    return catalogCurrent ? clubInWorld(catalogCurrent, world) : undefined;
  }
  function careerPeak(player: Player) {
    return Math.max(player.rating, ...player.history.flatMap((season) => [season.before, season.after]));
  }
  function isDeclining(player: Player) {
    const latest = player.history[0];
    return player.age >= 32 || player.fitness < 65 || !!latest && latest.after < latest.before || player.rating <= careerPeak(player) - 3;
  }
  function idealClubLevel(player: Player) {
    return player.rating >= 87 ? 5 : player.rating >= 80 ? 4 : player.rating >= 72 ? 3 : player.rating >= 64 ? 2 : 1;
  }
  function hasOutgrownClub(player: Player, world?: WorldState | null) {
    const current = currentClubFor(player, world);
    if (!current || player.squad === "academy") return false;
    const state = clubSeasonState(world, current.name, current.country);
    const levelGap = idealClubLevel(player) - current.level;
    const qualityGap = state ? player.rating - state.squadQuality : 0;
    return player.age >= 19 && (levelGap >= 2 || levelGap >= 1 && qualityGap >= 5);
  }
  function canRequestTransfer(player: Player, world?: WorldState | null) {
    return player.squad === "senior" && player.contractYears > 0 && player.age >= 19
      && !!currentClubFor(player, world)
      && (hasOutgrownClub(player, world) || player.morale <= 50 || player.clubSeasons >= 4);
  }
  function marketRoute(club: Club, player: Player, world?: WorldState | null) {
    const current = currentClubFor(player, world);
    const formerClub = player.history.some((season) => season.club === club.name && season.country === club.country);
    const familiarCountry = player.history.some((season) => season.country === club.country);
    if (formerClub) return "former-club" as const;
    if (club.country === current?.country) return "current-country" as const;
    if (club.country === player.nation) return "home-country" as const;
    if (familiarCountry) return "familiar-country" as const;
    return "new-foreign" as const;
  }
  function formerClubReturnFits(club: Club, player: Player) {
    const spells = player.history.filter((season) => season.club === club.name && season.country === club.country);
    if (!spells.length) return false;
    const seasonsPlayed = spells.reduce((total, season) => total + Math.max(1, season.toAge - season.fromAge), 0);
    const appearances = spells.reduce((total, season) => total + season.apps, 0);
    if (seasonsPlayed < 2 && appearances < 35) return false;
    const peakAtClub = Math.max(...spells.flatMap((season) => [season.before, season.after]));
    const minimumRating = ({ 5: 82, 4: 74, 3: 68, 2: 61, 1: 54 } as Record<number, number>)[club.level] ?? 54;
    if (player.rating < minimumRating || player.rating < peakAtClub - 12) return false;
    const yearsAway = Math.max(0, player.age - Math.max(...spells.map((season) => season.toAge)));
    if (!isDeclining(player) && yearsAway < 2) return false;
    return club.level <= idealClubLevel(player) + (isDeclining(player) ? 1 : 0);
  }
  function agentCanReach(club: Club, player: Player, world?: WorldState | null) {
    const route = marketRoute(club, player, world);
    if (route !== "new-foreign") return true;
    const profile = agentProfile(player.agent);
    if (profile.market === "none") return false;
    if (profile.market === "development") return player.age <= 25 && DEVELOPMENT_MARKETS.has(club.country);
    if (profile.market === "veteran") return player.age >= 29 && VETERAN_MARKETS.has(club.country);
    return true;
  }
  function isPlausibleMarketClub(club: Club, player: Player, world?: WorldState | null) {
    const route = marketRoute(club, player, world);
    const current = currentClubFor(player, world);
    if (route === "former-club" && !formerClubReturnFits(club, player)) return false;
    if (clubDivision(club) > 1 && !["former-club", "current-country", "home-country", "familiar-country"].includes(route)) return false;
    if (player.age < 18 && club.country !== player.nation && club.country !== current?.country) return false;
    if (!agentCanReach(club, player, world)) return false;
    if (player.age <= 21 && route === "new-foreign" && !DEVELOPMENT_MARKETS.has(club.country) && club.development < 5 && player.agent !== "Elite super-agent") return false;
    if (player.age >= 31 && route === "new-foreign" && !VETERAN_MARKETS.has(club.country) && club.level < 4) return false;
    return true;
  }
  function offerReason(club: Club, player: Player, role: Role, world?: WorldState | null) {
    const catalogCurrent = clubByName(player.currentClub);
    const current = catalogCurrent ? clubInWorld(catalogCurrent, world) : undefined;
    const isFormerClub = player.history.some((season) => season.club === club.name && season.country === club.country);
    const isHomecoming = current && current.country !== player.nation && club.country === player.nation;
    if (isFormerClub) return isDeclining(player)
      ? "A familiar club believes your experience can lead them again"
      : "A former club wants to reopen a successful chapter";
    if (isHomecoming) return "A homecoming with a clearer route to senior minutes";
    if (player.age >= 32) return "One last adventure, one serious contract";
    const steppingStones = ["POR", "NED", "BEL", "CRO"];
    const establishedLeagues = ["ENG", "ESP", "GER", "ITA", "FRA"];
    const isTopFlightStep = clubDivision(club) === 1 && steppingStones.includes(club.country) && current?.country !== club.country;
    if (isTopFlightStep && current && !establishedLeagues.includes(current.country)) return "A proven bridge to a bigger league";
    if (isTopFlightStep && current && establishedLeagues.includes(current.country)) return "A top-flight reset with a clearer route to minutes";
    if (current && club.country !== current.country && club.country !== player.nation) return `${agentProfile(player.agent).name} opened a credible route abroad`;
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
  function acceptedFeeFloor(player: Player, buyer: Club, context: BidContext, world?: WorldState | null) {
    const current = currentClubFor(player, world);
    if (current?.country === "ISR" && buyer.country !== "ISR") {
      const ratio = context === "forced-sale" ? .35 : .45;
      return Math.min(player.value * ratio, 4_000_000);
    }
    if (context === "forced-sale") return player.value * .6;
    if (context === "player-request") return player.value * (hasOutgrownClub(player, world) ? .65 : .8);
    return player.value * .92;
  }
  function externalOffers(
    player: Player,
    count = 2,
    permanentOnly = false,
    requiresTransferFee = false,
    world?: WorldState | null,
    bidContext: BidContext = "standard",
  ): Offer[] {
    const ideal = idealClubLevel(player);
    const profile = agentProfile(player.agent);
    const declining = isDeclining(player);
    const market = CLUBS.map((club) => clubInWorld(club, world)).filter((club) => {
      const role = roleFor(player.rating, club.level, player.age, player.roleBoost);
      return club.name !== player.currentClub
        && isPlausibleMarketClub(club, player, world)
        && club.level >= ideal - (declining ? 2 : 1)
        && club.level <= ideal + profile.levelRange
        && (!requiresTransferFee || maxSingleFee(club, role) >= acceptedFeeFloor(player, club, bidContext, world));
    });
    const routeCounts = new Map<string, number>();
    market.forEach((club) => {
      const route = marketRoute(club, player, world);
      routeCounts.set(route, (routeCounts.get(route) ?? 0) + 1);
    });
    const routeWeight = (club: Club) => {
      const route = marketRoute(club, player, world);
      const base = route === "former-club" ? profile.formerClubWeight * (declining ? .18 : .06)
        : route === "current-country" ? profile.domesticWeight
          : route === "home-country" ? profile.homeWeight * (declining ? 1.45 : 1)
            : route === "familiar-country" ? profile.familiarCountryWeight * (declining ? 1.35 : 1)
              : profile.foreignWeight * (.35 + player.reputation / 100) * (currentClubFor(player, world) && clubDivision(currentClubFor(player, world)!) >= 3 ? .6 : 1);
      return Math.max(.001, base / Math.max(1, routeCounts.get(route) ?? 1));
    };
    const desiredCount = Math.min(3, count + profile.offerBonus);
    const selected = market
      .map((club) => ({ club, key: Math.pow(Math.max(random(), Number.MIN_VALUE), 1 / routeWeight(club)) }))
      .sort((left, right) => right.key - left.key)
      .slice(0, desiredCount)
      .map(({ club }) => club);
    return selected.map((club) => {
      const role = roleFor(player.rating, club.level, player.age, player.roleBoost);
      const loan = !permanentOnly && player.age <= 22 && role === "Prospect" && random() < .55;
      const current = currentClubFor(player, world);
      const route = marketRoute(club, player, world);
      const label = route === "former-club" ? "Former-club return" : club.country === current?.country ? "Domestic move" : club.country === player.nation ? "Homecoming" : player.age >= 31 ? "Final adventure" : "Move abroad";
      return makeOffer(club, player, loan ? "Loan proposal" : label, loan ? "loan" : "permanent", loan ? "Starter" : role, undefined, world);
    });
  }
  function permanentOffers(player: Player, count = 2, requiresTransferFee = false, world?: WorldState | null, bidContext: BidContext = "standard"): Offer[] {
    return externalOffers(player, count, true, requiresTransferFee, world, bidContext);
  }
  function contractedBids(player: Player, count = 2, world?: WorldState | null, bidContext: BidContext = "standard"): Offer[] {
    return permanentOffers(player, count, true, world, bidContext).map((offer) => {
      const rounding = clubDivision(offer) <= 2 ? 50_000 : 10_000;
      const floor = acceptedFeeFloor(player, offer, bidContext, world);
      const discountedMarket = floor < player.value * .85;
      const proposedFee = discountedMarket
        ? Math.round(floor * (randomInt(100, 145) / 100) / rounding) * rounding
        : Math.round(player.value * (randomInt(92, 128) / 100) / rounding) * rounding;
      const fee = Math.min(Math.max(floor, proposedFee), maxSingleFee(offer, offer.role));
      return makeOffer(offer, player, "Accepted transfer bid", "permanent", offer.role, `${offer.name} agreed ${formatMoney(fee)} with ${player.currentClub} · proposed ${offer.role.toLowerCase()} role`);
    });
  }
  function forcedSaleDecision(player: Player, world?: WorldState | null) {
    const marketRateBids = contractedBids(player, 3, world);
    const offers = marketRateBids.length ? marketRateBids : contractedBids(player, 3, world, "forced-sale");
    if (!offers.length) return null;
    const current = currentClubFor(player, world);
    return decision(
      "forced-sale",
      `${player.currentClub} has accepted that you must be sold`,
      current && current.level <= 2
        ? "Your value is now larger than several items on the club balance sheet. The board calls the sale ‘strategic’."
        : "The accounts need help. The board has discovered that loyalty does not appear as cash on the annual report.",
      offers,
    );
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
  function eligibleScenario(player: Player, world?: WorldState | null) {
    const current = currentClubFor(player, world);
    const currentState = current ? clubSeasonState(world, current.name, current.country) : undefined;
    const hasEuropeanPlace = !!world?.history.at(-1)?.nextEuropeanQualification?.some((place) =>
      place.club === player.currentClub && place.country === current?.country);
    const formerClub = player.history.find((season) => season.club !== player.currentClub)?.club ?? "your former club";
    const fits = (item: Scenario) => (!item.minAge || player.age >= item.minAge)
      && (!item.maxAge || player.age <= item.maxAge)
      && (!item.minRating || player.rating >= item.minRating)
      && (!item.minReputation || player.reputation >= item.minReputation)
      && (!item.maxFitness || player.fitness <= item.maxFitness)
      && (!item.maxMorale || player.morale <= item.maxMorale)
      && (!item.requiresAbroad || !!current && current.country !== player.nation)
      && (!item.countryTags || !!current && item.countryTags.includes(current.country))
      && (!item.allowedPositions || item.allowedPositions.includes(player.position))
      && (!item.minClubLevel || !!current && current.level >= item.minClubLevel)
      && (!item.maxClubLevel || !!current && current.level <= item.maxClubLevel)
      && (!item.minClubSeasons || player.clubSeasons >= item.minClubSeasons)
      && (!item.minPreviousFinish || !!currentState?.previousFinish && currentState.previousFinish >= item.minPreviousFinish)
      && (!item.maxPreviousFinish || !!currentState?.previousFinish && currentState.previousFinish <= item.maxPreviousFinish)
      && (!item.requiresEuropeanPlace || hasEuropeanPlace)
      && (!item.requiresFormerClub || player.history.some((season) => season.club !== player.currentClub))
      && (!item.allowedAgents || item.allowedAgents.includes(player.agent))
      && (!item.needsCaps || player.caps > 0);
    const available = SCENARIOS.filter((item) => !player.seenScenarios.includes(item.id) && fits(item));
    const fallback = SCENARIOS.filter(fits);
    const selected = shuffle(available.length ? available : fallback)[0];
    const replace = (value: string) => value
      .replaceAll("{club}", player.currentClub)
      .replaceAll("{league}", current?.league ?? "the league")
      .replaceAll("{formerClub}", formerClub);
    return {
      ...selected,
      title: replace(selected.title),
      description: replace(selected.description),
      options: selected.options.map((option) => ({
        ...option,
        label: replace(option.label),
        hint: replace(option.hint),
        outcomes: option.outcomes.map((outcome) => ({ ...outcome, label: replace(outcome.label) })),
      })),
    };
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
  function seasonNarrative(role: Role, apps: number, movedAbroad: boolean, injured: boolean, ratingChange: number, age: number, honourKinds: string[]) {
    if (honourKinds.includes("ballon-dor")) return "You won the Ballon d'Or. The group chat becomes briefly respectful.";
    if (honourKinds.includes("player-of-season") || honourKinds.includes("golden-boot")) return "You collected an individual award. Your agent has already made it their profile photo.";
    if (honourKinds.includes("continental-title")) return "You conquered Europe. The medal is heavier than it looked on television.";
    if (honourKinds.includes("league-title") || honourKinds.includes("national-cup")) return "You lifted silverware. Nobody remembers the November draw anymore.";
    if (injured && ratingChange < 0) return "The injury cost more than appearances. Your sharpness and rating both took a hit.";
    if (ratingChange < 0 && age >= 30) return "The reading of the game remains; the body has started charging interest.";
    if (ratingChange < 0) return "Minutes, form and confidence all slipped. Your rating followed them down.";
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
      developmentTrend: 0,
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
    const developmentAge = player.age + (years - 1) / 2;
    const ageBase = developmentAge < 19 ? 4.5 : developmentAge < 22 ? 3.5 : developmentAge < 25 ? 2
      : developmentAge < 28 ? 1 : developmentAge < 30 ? .3 : developmentAge < 32 ? -.8
        : developmentAge < 34 ? -1.8 : -3;
    const positionAgeAdjustment = player.position === "GK"
      ? (developmentAge < 21 ? -1 : developmentAge >= 30 ? 1.4 : 0)
      : ["CB", "CDM"].includes(player.position) && developmentAge >= 29 ? .6
        : ["LW", "RW", "ST"].includes(player.position) && developmentAge >= 30 ? -.5 : 0;
    const minutesPerYear = apps / years;
    const minutesBonus = minutesPerYear >= 30 ? 1 : minutesPerYear >= 18 ? 0 : minutesPerYear >= 10 ? -1.4 : -2.4;
    const clubDevelopment = (destination.development - 3) * .55;
    const moraleImpact = (player.morale - 60) / 35;
    const fitnessImpact = player.fitness < 45 ? -2 : player.fitness < 65 ? -1 : player.fitness >= 92 ? .25 : 0;
    const injuryImpact = injured ? 2 + Math.max(0, developmentAge - 30) * .08 : 0;
    const formVariance = randomInt(-1, 1);
    const expectedOutput = apps * (rates.goals + rates.assists);
    const outputRatio = expectedOutput > 0 ? (goals + assists) / expectedOutput : 1;
    const performanceImpact = ["GK", "CB", "CDM"].includes(player.position) ? 0
      : outputRatio >= 1.18 ? .8 : outputRatio >= .78 ? 0 : outputRatio >= .55 ? -.7 : -1.2;
    const trajectory = clamp(player.developmentTrend ?? 0, -3, 3);
    const rawGrowth = Math.round((ageBase + positionAgeAdjustment + minutesBonus + clubDevelopment + moraleImpact + fitnessImpact + trajectory + formVariance + performanceImpact - injuryImpact) * Math.sqrt(years) / 1.7);
    const changedRating = player.rating + rawGrowth;
    const nextRating = clamp(rawGrowth > 0 ? Math.min(player.potential, changedRating) : changedRating, 45, 96);
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
      event: seasonNarrative(destination.role, apps, destination.country !== player.nation, injured, nextRating - player.rating, player.age + years, playerHonours.map((honour) => honour.kind)),
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
      developmentTrend: trajectory > 0 ? trajectory - 1 : trajectory < 0 ? trajectory + 1 : 0,
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
    const current = currentClubFor(player, world);
    const outgrown = hasOutgrownClub(player, world);
    const exportPressure = current?.country === "ISR" && outgrown ? .16 : 0;
    const interestChance = clamp(.18 + player.reputation / 170 + formBonus + agentProfile(player.agent).interestBonus
      + (outgrown ? .24 : 0) + exportPressure, .12, .94);
    const outsideInterest = player.squad === "academy" || random() >= interestChance ? [] : contractedBids(player, random() < .72 ? 1 : 2, world);
    return decision(
      outsideInterest.length ? "transfer-interest" : "continue",
      outsideInterest.length ? "Transfer bids have arrived while you are under contract" : `What should the next chapter at ${player.currentClub} look like?`,
      outsideInterest.length ? `${player.currentClub} has agreed a fee, but your ${player.contractYears}-year contract does not force you to leave. Stay, or accept one of the approaches.` : "No artificial transfer window this time. The club expects you back, and staying is a complete career choice.",
      [...(stay ? [stay] : []), ...outsideInterest],
    );
  }

  function requestTransfer(player: Player, world?: WorldState | null) {
    const bids = contractedBids(player, 2, world, "player-request");
    const current = currentClubFor(player, world);
    const outgrown = hasOutgrownClub(player, world);
    const pressuredPlayer = {
      ...player,
      morale: clamp(player.morale - (bids.length ? 6 : 12), 0, 100),
      reputation: clamp(player.reputation - (outgrown ? 0 : 2), 0, 100),
    };
    const stay = stayOffer(pressuredPlayer, "stay", world);
    const withdraw = stay ? {
      ...stay,
      label: "Withdraw transfer request",
      reason: bids.length
        ? "Back down, repair the relationship and continue at the club"
        : "The board found no acceptable destination · return to training",
    } : null;
    const description = bids.length
      ? current?.country === "ISR" && bids.some((bid) => bid.country !== "ISR")
        ? "Your agent pushed for an overseas move. The club knows Israeli-league stars are difficult to keep once a serious foreign offer lands."
        : "You told the club that you want a new challenge. The request changed the negotiating balance and your agent brought concrete bids."
      : "You asked to leave, but no credible buyer reached even the reduced asking price. The board refuses to release you for nothing.";
    return {
      player: pressuredPlayer,
      decision: decision(
        "transfer-request",
        bids.length ? "Your transfer request has produced offers" : `${player.currentClub} blocks your transfer request`,
        description,
        [...(withdraw ? [withdraw] : []), ...bids],
      ),
    };
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
    if (player.squad === "academy") return random() < .46 ? { type: "scenario", scenario: eligibleScenario(player, world) } : ordinaryDecision(player, world);
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
      const forcedSale = forcedSaleDecision(player, world);
      if (forcedSale) return forcedSale;
    }
    const seasons = Math.max(1, (latest?.toAge ?? player.age) - (latest?.fromAge ?? player.age - 1));
    if ((latest?.apps ?? 99) / seasons < 12 && player.age >= 20 && random() < .42) {
      return decision("released", `${player.currentClub} no longer sees a role for you`, "The manager says this is purely professional, which is football language for ‘please choose one of these exits’.", permanentOffers(player, 3, false, world));
    }
    return random() < .54 ? { type: "scenario", scenario: eligibleScenario(player, world) } : ordinaryDecision(player, world);
  }

  function recoverDecision(player: Player, kind: CareerDecision["kind"], world?: WorldState | null): CareerDecision {
    if (kind === "forced-sale") return forcedSaleDecision(player, world) ?? ordinaryDecision(player, world);
    return ordinaryDecision(player, world);
  }

  function resolveScenario(player: Player, scenario: Scenario, option: ScenarioOption): ScenarioResolution {
    const roll = random();
    let cursor = 0;
    const result = option.outcomes.find((item) => { cursor += item.probability; return roll <= cursor; }) ?? option.outcomes[option.outcomes.length - 1];
    const effect = result.effect;
    const potential = clamp(player.potential + (effect.potential ?? 0), 45, 96);
    const rating = clamp(player.rating + (effect.rating ?? 0), 45, potential);
    return {
      player: {
        ...player, rating, potential,
        value: Math.round(marketValue(rating, player.age, potential) * (effect.value ?? 1)),
        morale: clamp(player.morale + (effect.morale ?? 0), 0, 100),
        fitness: clamp(player.fitness + (effect.fitness ?? 0), 0, 100),
        reputation: clamp(player.reputation + (effect.reputation ?? 0), 0, 100),
        roleBoost: clamp(player.roleBoost + (effect.roleBoost ?? 0), -2, 2),
        developmentTrend: clamp((player.developmentTrend ?? 0) + (effect.development ?? 0), -3, 3),
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

  return {
    createCareer, simulateSeason, ordinaryDecision, nextBeat, recoverDecision, requestTransfer,
    canRequestTransfer, hasOutgrownClub, resolveScenario, achievements, marketOffers: externalOffers,
  };
}

export const careerEngine = createCareerEngine();
