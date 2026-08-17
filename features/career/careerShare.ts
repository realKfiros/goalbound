import { country } from "./catalog";
import type { Player, PlayerHonour, Season } from "./domain";

export type CareerClubSpell = {
  club: string;
  country: string;
  league: string;
  fromAge: number;
  toAge: number;
  apps: number;
  goals: number;
  assists: number;
  trophies: number;
  ratingBefore: number;
  ratingAfter: number;
};

export type CareerSummary = {
  nation: ReturnType<typeof country>;
  label: string;
  debutAge: number;
  seasons: number;
  peakRating: number;
  uniqueClubs: number;
  countriesPlayed: number;
  spells: CareerClubSpell[];
  honours: PlayerHonour[];
  breakouts: number;
  seriousInjuries: number;
  bestSeason: Season | null;
  biggestRise: Season | null;
};

function legacyLabel(rating: number, peakRating: number, apps: number) {
  if (peakRating >= 92 || rating >= 90) return "WORLD ICON";
  if (peakRating >= 86 || rating >= 82) return "ELITE CAREER";
  if (peakRating >= 78 || apps >= 350) return "PROVEN PROFESSIONAL";
  return "CULT HERO";
}

function chronologicalHistory(history: Season[]) {
  return history
    .map((season, index) => ({ season, index }))
    .sort((a, b) => a.season.fromAge - b.season.fromAge || a.season.toAge - b.season.toAge || b.index - a.index)
    .map(({ season }) => season);
}

function clubSpells(history: Season[]) {
  return chronologicalHistory(history).reduce<CareerClubSpell[]>((spells, season) => {
    const current = spells.at(-1);
    if (current?.club === season.club && current.country === season.country) {
      current.toAge = Math.max(current.toAge, season.toAge);
      current.league = season.league;
      current.apps += season.apps;
      current.goals += season.goals;
      current.assists += season.assists;
      current.trophies += season.trophies;
      current.ratingAfter = season.after;
      return spells;
    }

    spells.push({
      club: season.club,
      country: season.country,
      league: season.league,
      fromAge: season.fromAge,
      toAge: season.toAge,
      apps: season.apps,
      goals: season.goals,
      assists: season.assists,
      trophies: season.trophies,
      ratingBefore: season.before,
      ratingAfter: season.after,
    });
    return spells;
  }, []);
}

function careerHonours(history: Season[]) {
  const honours = chronologicalHistory(history)
    .flatMap((season) => season.honours ?? [])
    .flatMap((annual) => annual.playerHonours ?? []);
  return [...new Map(honours.map((honour) => [honour.id, honour])).values()];
}

export function careerSummary(player: Player): CareerSummary {
  const history = chronologicalHistory(player.history);
  const spells = clubSpells(history);
  const ratings = history.flatMap((season) => [season.before, season.after]);
  const peakRating = Math.max(player.rating, ...ratings);
  const uniqueCountries = new Set(history.map((season) => season.country));
  const uniqueClubs = new Set(history.map((season) => season.club));
  const bestSeason = history.reduce<Season | null>((best, season) => {
    const contribution = season.goals + season.assists;
    const bestContribution = best ? best.goals + best.assists : -1;
    return contribution > bestContribution ? season : best;
  }, null);
  const biggestRise = history.reduce<Season | null>((best, season) => {
    const rise = season.after - season.before;
    const bestRise = best ? best.after - best.before : Number.NEGATIVE_INFINITY;
    return rise > bestRise ? season : best;
  }, null);

  return {
    nation: country(player.nation),
    label: legacyLabel(player.rating, peakRating, player.totalApps),
    debutAge: history[0]?.fromAge ?? player.age,
    seasons: history.reduce((total, season) => total + Math.max(1, season.toAge - season.fromAge), 0),
    peakRating,
    uniqueClubs: uniqueClubs.size || (player.currentClub ? 1 : 0),
    countriesPlayed: uniqueCountries.size || 1,
    spells,
    honours: careerHonours(history),
    breakouts: history.filter((season) => season.breakout).length,
    seriousInjuries: history.filter((season) => season.injury === "serious").length,
    bestSeason,
    biggestRise,
  };
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
  context.stroke();
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, minSize: number) {
  let size = startSize;
  context.font = `900 ${size}px Arial, sans-serif`;
  while (size > minSize && context.measureText(text).width > maxWidth) {
    size -= 2;
    context.font = `900 ${size}px Arial, sans-serif`;
  }
  return size;
}

function drawStat(context: CanvasRenderingContext2D, x: number, y: number, value: number, label: string) {
  context.textAlign = "center";
  context.fillStyle = "#f4f5f1";
  context.font = "900 35px Arial, sans-serif";
  context.fillText(value.toLocaleString("en-US"), x, y);
  context.fillStyle = "#8f958b";
  context.font = "700 12px Arial, sans-serif";
  context.fillText(label.toUpperCase(), x, y + 25);
}

export function careerShareCanvasLayout(player: Player) {
  const summary = careerSummary(player);
  const namedTeamTrophies = summary.honours.filter((honour) => honour.category === "team").length;
  const legacyTrophies = Math.max(0, player.trophies - namedTeamTrophies);
  const routeRows = Math.max(1, summary.spells.length);
  const honourRows = Math.max(1, summary.honours.length + (legacyTrophies > 0 ? 1 : 0));
  const routeStart = 615;
  const routeRowHeight = 86;
  const honoursHeading = routeStart + routeRows * routeRowHeight + 60;
  const honoursStart = honoursHeading + 48;
  const honourRowHeight = 78;
  const footer = honoursStart + honourRows * honourRowHeight + 66;

  return {
    width: 1400,
    height: Math.max(980, footer + 72),
    routeRows,
    honourRows,
    routeStart,
    routeRowHeight,
    honoursHeading,
    honoursStart,
    honourRowHeight,
    footer,
    legacyTrophies,
  };
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create the career image.")), "image/png");
  });
}

export async function createCareerShareImage(player: Player) {
  const summary = careerSummary(player);
  const layout = careerShareCanvasLayout(player);
  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image creation is not supported by this browser.");

  const background = context.createLinearGradient(0, 0, layout.width, layout.height);
  background.addColorStop(0, "#090b09");
  background.addColorStop(1, "#171c11");
  context.fillStyle = background;
  context.fillRect(0, 0, layout.width, layout.height);

  context.strokeStyle = "rgba(199,255,53,.07)";
  context.lineWidth = 1;
  for (let x = 0; x <= layout.width; x += 80) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, layout.height); context.stroke();
  }
  for (let y = 0; y <= layout.height; y += 80) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(layout.width, y); context.stroke();
  }

  context.fillStyle = "#c7ff35";
  context.fillRect(0, 0, 12, layout.height);
  context.textAlign = "left";
  context.font = "900 21px Arial, sans-serif";
  context.fillText("GOALBOUND", 72, 65);
  context.fillStyle = "#8f958b";
  context.font = "700 14px Arial, sans-serif";
  context.fillText("CAREER COMPLETE", 72, 98);

  context.fillStyle = "#f4f5f1";
  fitText(context, player.name, 880, 82, 38);
  context.fillText(player.name, 72, 188);
  context.fillStyle = "#b8bdb4";
  context.font = "600 21px Arial, sans-serif";
  context.fillText(`${summary.nation.name}  ·  ${player.position}  ·  Ages ${summary.debutAge}–${player.age}`, 74, 232);

  context.fillStyle = "rgba(199,255,53,.055)";
  context.strokeStyle = "rgba(199,255,53,.34)";
  context.lineWidth = 2;
  roundedRect(context, 1086, 50, 242, 252, 22);
  context.fillStyle = "#c7ff35";
  context.textAlign = "center";
  context.font = "700 13px Arial, sans-serif";
  context.fillText("PEAK OVR", 1207, 92);
  context.fillStyle = "#f4f5f1";
  context.font = "900 116px Arial, sans-serif";
  context.fillText(String(summary.peakRating), 1202, 204);
  context.fillStyle = "#c7ff35";
  context.font = "800 14px Arial, sans-serif";
  context.fillText(summary.label, 1207, 266);

  context.strokeStyle = "rgba(255,255,255,.12)";
  context.beginPath(); context.moveTo(72, 350); context.lineTo(1328, 350); context.stroke();
  const statX = [150, 370, 590, 810, 1030, 1250];
  drawStat(context, statX[0], 422, player.totalApps, "Apps");
  drawStat(context, statX[1], 422, player.totalGoals, "Goals");
  drawStat(context, statX[2], 422, player.totalAssists, "Assists");
  drawStat(context, statX[3], 422, player.trophies, "Trophies");
  drawStat(context, statX[4], 422, player.caps, "Caps");
  drawStat(context, statX[5], 422, player.nationalGoals, "Intl goals");

  context.textAlign = "left";
  context.fillStyle = "#8f958b";
  context.font = "700 13px Arial, sans-serif";
  context.fillText("CLUB JOURNEY", 72, 535);
  context.textAlign = "right";
  context.fillText(`${summary.seasons} SEASONS  ·  ${summary.uniqueClubs} CLUBS  ·  ${summary.countriesPlayed} COUNTRIES`, 1328, 535);

  const spells = summary.spells.length ? summary.spells : [{
    club: player.currentClub, country: player.nation, league: "Career club", fromAge: summary.debutAge,
    toAge: player.age, apps: player.totalApps, goals: player.totalGoals, assists: player.totalAssists,
    trophies: player.trophies, ratingBefore: player.rating, ratingAfter: player.rating,
  }];
  spells.forEach((spell, index) => {
    const top = layout.routeStart + index * layout.routeRowHeight;
    context.fillStyle = index % 2 ? "rgba(255,255,255,.035)" : "rgba(255,255,255,.055)";
    context.strokeStyle = "rgba(255,255,255,.08)";
    roundedRect(context, 72, top, 1256, 72, 8);
    context.textAlign = "left";
    context.fillStyle = "#c7ff35";
    context.font = "800 12px monospace";
    context.fillText(String(index + 1).padStart(2, "0"), 94, top + 42);
    context.fillStyle = "#f4f5f1";
    fitText(context, spell.club, 480, 24, 14);
    context.fillText(spell.club, 140, top + 31);
    context.fillStyle = "#9fa49b";
    context.font = "600 13px Arial, sans-serif";
    context.fillText(`${country(spell.country).name}  ·  ${spell.league}  ·  Ages ${spell.fromAge}–${spell.toAge}`, 140, top + 54);
    context.textAlign = "right";
    context.fillStyle = "#d8dbd5";
    context.font = "700 14px Arial, sans-serif";
    context.fillText(`${spell.apps} APPS   ·   ${spell.goals} GOALS   ·   ${spell.assists} ASSISTS`, 1148, top + 31);
    context.fillStyle = "#c7ff35";
    context.fillText(`OVR ${spell.ratingBefore} → ${spell.ratingAfter}`, 1304, top + 53);
  });

  context.textAlign = "left";
  context.fillStyle = "#8f958b";
  context.font = "700 13px Arial, sans-serif";
  context.fillText("HONOURS WON", 72, layout.honoursHeading);
  context.textAlign = "right";
  context.fillText(`${summary.honours.length} NAMED HONOURS  ·  ${player.trophies} TEAM TROPHIES`, 1328, layout.honoursHeading);

  const honourRows: Array<{ icon: string; name: string; detail: string; category: string }> = summary.honours.map((honour) => ({
    icon: honour.icon,
    name: honour.name,
    detail: `${honour.season}  ·  ${honour.club}`,
    category: honour.category,
  }));
  if (layout.legacyTrophies > 0) honourRows.push({
    icon: "🏆", name: `Earlier team silverware ×${layout.legacyTrophies}`,
    detail: "Trophies recorded before named honours", category: "team",
  });
  if (!honourRows.length) honourRows.push({
    icon: "—", name: "No honours recorded", detail: "A career measured in more than medals", category: "career",
  });

  honourRows.forEach((honour, index) => {
    const top = layout.honoursStart + index * layout.honourRowHeight;
    context.fillStyle = index % 2 ? "rgba(199,255,53,.035)" : "rgba(199,255,53,.06)";
    context.strokeStyle = "rgba(199,255,53,.11)";
    roundedRect(context, 72, top, 1256, 66, 8);
    context.textAlign = "left";
    context.fillStyle = "#f4f5f1";
    context.font = "24px Arial, sans-serif";
    context.fillText(honour.icon, 94, top + 41);
    context.fillStyle = "#f4f5f1";
    fitText(context, honour.name, 850, 21, 13);
    context.fillText(honour.name, 140, top + 29);
    context.fillStyle = "#9fa49b";
    context.font = "600 12px Arial, sans-serif";
    context.fillText(honour.detail, 140, top + 51);
    context.fillStyle = "#c7ff35";
    context.textAlign = "right";
    context.font = "800 12px Arial, sans-serif";
    context.fillText(honour.category.toUpperCase(), 1304, top + 38);
  });

  context.fillStyle = "#c7ff35";
  context.textAlign = "right";
  context.font = "800 15px Arial, sans-serif";
  context.fillText("goalbound.kfiros.com", 1328, layout.footer);
  context.fillStyle = "#71766d";
  context.textAlign = "left";
  context.font = "700 12px Arial, sans-serif";
  context.fillText("THE ENTIRE CAREER. ONE CARD.", 72, layout.footer);

  return canvasBlob(canvas);
}

function imageFilename(player: Player) {
  const safeName = player.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "career";
  return `goalbound-${safeName}-career.png`;
}

export function downloadCareerShareImage(blob: Blob, player: Player) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = imageFilename(player);
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function shareCareerImage(blob: Blob, player: Player) {
  const file = new File([blob], imageFilename(player), { type: "image/png" });
  const shareData: ShareData = {
    title: `${player.name}'s Goalbound career`,
    text: `${player.name} retired after ${player.totalApps} appearances, ${player.totalGoals} goals and ${player.trophies} trophies.`,
    files: [file],
  };

  if (navigator.share && navigator.canShare?.(shareData)) {
    await navigator.share(shareData);
    return "shared" as const;
  }

  downloadCareerShareImage(blob, player);
  return "downloaded" as const;
}
