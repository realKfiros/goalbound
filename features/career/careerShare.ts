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

function ellipsize(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && context.measureText(`${result}…`).width > maxWidth) result = result.slice(0, -1);
  return `${result}…`;
}

function drawStat(context: CanvasRenderingContext2D, x: number, value: number, label: string) {
  context.textAlign = "center";
  context.fillStyle = "#f4f5f1";
  context.font = "900 31px Arial, sans-serif";
  context.fillText(value.toLocaleString("en-US"), x, 470);
  context.fillStyle = "#8f958b";
  context.font = "700 12px Arial, sans-serif";
  context.fillText(label.toUpperCase(), x, 494);
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create the career image.")), "image/png");
  });
}

export async function createCareerShareImage(player: Player) {
  const summary = careerSummary(player);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image creation is not supported by this browser.");

  const background = context.createLinearGradient(0, 0, 1200, 630);
  background.addColorStop(0, "#090b09");
  background.addColorStop(1, "#171c11");
  context.fillStyle = background;
  context.fillRect(0, 0, 1200, 630);

  context.strokeStyle = "rgba(199,255,53,.07)";
  context.lineWidth = 1;
  for (let x = 0; x <= 1200; x += 80) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 630); context.stroke();
  }
  for (let y = 0; y <= 630; y += 80) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(1200, y); context.stroke();
  }

  context.fillStyle = "#c7ff35";
  context.fillRect(0, 0, 12, 630);
  context.textAlign = "left";
  context.font = "900 19px Arial, sans-serif";
  context.fillText("GOALBOUND", 64, 61);
  context.fillStyle = "#8f958b";
  context.font = "700 14px Arial, sans-serif";
  context.fillText("CAREER COMPLETE", 64, 92);

  context.fillStyle = "#f4f5f1";
  fitText(context, player.name, 720, 74, 38);
  context.fillText(player.name, 64, 174);
  context.fillStyle = "#b8bdb4";
  context.font = "600 20px Arial, sans-serif";
  context.fillText(`${summary.nation.name}  ·  ${player.position}  ·  Ages ${summary.debutAge}–${player.age}`, 66, 212);

  context.fillStyle = "rgba(199,255,53,.055)";
  context.strokeStyle = "rgba(199,255,53,.34)";
  context.lineWidth = 2;
  roundedRect(context, 898, 49, 238, 255, 22);
  context.fillStyle = "#c7ff35";
  context.textAlign = "center";
  context.font = "700 13px Arial, sans-serif";
  context.fillText("PEAK OVR", 1017, 91);
  context.fillStyle = "#f4f5f1";
  context.font = "900 116px Arial, sans-serif";
  context.fillText(String(summary.peakRating), 1012, 203);
  context.fillStyle = "#c7ff35";
  context.font = "800 14px Arial, sans-serif";
  context.fillText(summary.label, 1017, 265);

  context.textAlign = "left";
  context.fillStyle = "#8f958b";
  context.font = "700 12px Arial, sans-serif";
  context.fillText("CLUB JOURNEY", 66, 277);
  context.fillStyle = "#f4f5f1";
  context.font = "800 25px Arial, sans-serif";
  const clubNames = summary.spells.map((spell) => spell.club);
  const compactJourney = clubNames.length > 5 ? `${clubNames.slice(0, 5).join("  →  ")}  +${clubNames.length - 5}` : clubNames.join("  →  ");
  context.fillText(ellipsize(context, compactJourney || player.currentClub, 1050), 66, 318);
  context.fillStyle = "#8f958b";
  context.font = "600 14px Arial, sans-serif";
  context.fillText(`${summary.seasons} seasons  ·  ${summary.uniqueClubs} clubs  ·  ${summary.countriesPlayed} countries`, 66, 350);

  context.strokeStyle = "rgba(255,255,255,.12)";
  context.beginPath(); context.moveTo(66, 391); context.lineTo(1136, 391); context.stroke();
  const statX = [126, 318, 510, 702, 894, 1080];
  drawStat(context, statX[0], player.totalApps, "Apps");
  drawStat(context, statX[1], player.totalGoals, "Goals");
  drawStat(context, statX[2], player.totalAssists, "Assists");
  drawStat(context, statX[3], player.trophies, "Trophies");
  drawStat(context, statX[4], player.caps, "Caps");
  drawStat(context, statX[5], player.nationalGoals, "Intl goals");

  context.textAlign = "left";
  context.fillStyle = "#8f958b";
  context.font = "700 12px Arial, sans-serif";
  context.fillText("HONOURS", 66, 546);
  context.fillStyle = "#d9ddd4";
  context.font = "700 16px Arial, sans-serif";
  const honourLine = summary.honours.length
    ? summary.honours.slice(0, 3).map((honour) => honour.name).join("  ·  ")
    : player.trophies > 0 ? `${player.trophies} career trophies` : "A career measured in more than medals";
  context.fillText(ellipsize(context, honourLine, 820), 66, 579);
  context.fillStyle = "#c7ff35";
  context.textAlign = "right";
  context.font = "800 15px Arial, sans-serif";
  context.fillText("goalbound.kfiros.com", 1136, 579);

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
