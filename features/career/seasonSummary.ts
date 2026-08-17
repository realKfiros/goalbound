import type { AnnualHonours, ContinentalCompetition, PlayoffTie } from "./domain";

export type LeagueSeasonFocus = {
  position: number | null;
  totalClubs: number | null;
  result: string;
  detail: string;
};

export type EuropeanCampaignFocus = {
  competition: string;
  result: string;
  detail: string;
};

function ordinal(position: number) {
  const remainder100 = position % 100;
  if (remainder100 >= 11 && remainder100 <= 13) return `${position}th`;
  if (position % 10 === 1) return `${position}st`;
  if (position % 10 === 2) return `${position}nd`;
  if (position % 10 === 3) return `${position}rd`;
  return `${position}th`;
}

export function leagueSeasonFocus(annual: AnnualHonours, activeClub: string): LeagueSeasonFocus {
  const matchingGroups = (annual.standingGroups ?? []).filter((group) => group.clubs.includes(activeClub));
  const group = matchingGroups.at(-1);
  if (group) {
    const position = group.clubs.indexOf(activeClub) + 1;
    return {
      position,
      totalClubs: group.clubs.length,
      result: ordinal(position),
      detail: `${group.name} · ${position} of ${group.clubs.length}`,
    };
  }

  if ((annual.titles ?? [{ name: "Champion", winner: annual.champion }]).some((title) => title.winner === activeClub)) {
    return { position: 1, totalClubs: null, result: "Champions", detail: annual.league };
  }

  return { position: null, totalClubs: null, result: "Not recorded", detail: annual.league };
}

function tieOpponent(tie: PlayoffTie, activeClub: string) {
  return tie.home === activeClub ? tie.away : tie.home;
}

function clubTies(competition: ContinentalCompetition, activeClub: string) {
  return competition.bracket.ties.filter((tie) => tie.home === activeClub || tie.away === activeClub);
}

function qualifyingTies(competition: ContinentalCompetition, activeClub: string) {
  return competition.qualifyingBrackets.flatMap((bracket) => bracket.ties)
    .filter((tie) => tie.home === activeClub || tie.away === activeClub);
}

function competitionFocus(competition: ContinentalCompetition, activeClub: string, activeCountry: string): EuropeanCampaignFocus | null {
  const standingIndex = competition.table.findIndex((standing) => standing.club === activeClub && standing.country === activeCountry);
  const knockoutTies = clubTies(competition, activeClub);
  const qualifiers = qualifyingTies(competition, activeClub);
  const entered = standingIndex >= 0 || knockoutTies.length > 0 || qualifiers.length > 0;
  if (!entered) return null;

  if (competition.champion.club === activeClub && competition.champion.country === activeCountry) {
    return { competition: competition.shortName, result: "Champions", detail: "Won the final" };
  }

  const lastKnockoutTie = knockoutTies.at(-1);
  if (lastKnockoutTie) {
    const won = lastKnockoutTie.winner === activeClub;
    return {
      competition: competition.shortName,
      result: lastKnockoutTie.round,
      detail: won ? `Beat ${tieOpponent(lastKnockoutTie, activeClub)}` : `Eliminated by ${tieOpponent(lastKnockoutTie, activeClub)}`,
    };
  }

  if (standingIndex >= 0) {
    const position = standingIndex + 1;
    return {
      competition: competition.shortName,
      result: `League phase · ${ordinal(position)}`,
      detail: position <= 8 ? "Qualified for the Round of 16" : position <= 24 ? "Qualified for the knockout play-off" : "Eliminated",
    };
  }

  const lastQualifier = qualifiers.at(-1)!;
  const won = lastQualifier.winner === activeClub;
  return {
    competition: competition.shortName,
    result: `${lastQualifier.round} qualifying`,
    detail: won ? `Beat ${tieOpponent(lastQualifier, activeClub)}` : `Eliminated by ${tieOpponent(lastQualifier, activeClub)}`,
  };
}

export function europeanSeasonFocus(annual: AnnualHonours, activeClub: string, activeCountry: string) {
  return (annual.continentalRoll ?? [])
    .map((competition) => competitionFocus(competition, activeClub, activeCountry))
    .filter((focus): focus is EuropeanCampaignFocus => !!focus);
}
