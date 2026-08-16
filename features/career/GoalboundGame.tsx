"use client";

import { useEffect, useState } from "react";
import { SCENARIOS } from "./catalog";
import { CareerScreen } from "./components/CareerScreen";
import { HomeScreen } from "./components/HomeScreen";
import { SetupScreen } from "./components/SetupScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { TrophyRoomScreen } from "./components/TrophyRoomScreen";
import { DEFAULT_SAVE, type CareerBeat, type CareerDraft, type Motion, type Offer, type SavedGame, type ScenarioOption, type TrophyRoom } from "./domain";
import { careerEngine } from "./engine";
import { clearCareer, loadCareer, loadTrophyRoom, newCareerId, saveCareer, saveTrophyRoom } from "./storage";
import { EMPTY_TROPHY_ROOM, mergeCareerSnapshot, trophyRoomTotals } from "./trophyRoom";
import { createWorldState } from "./world";
import { GlobalStyles } from "./styles";

const DEFAULT_DRAFT: CareerDraft = { name: "Kai Nash", nation: "ENG", position: "ST", number: 9 };

export function GoalboundGame() {
  const [game, setGame] = useState<SavedGame>(DEFAULT_SAVE);
  const [draft, setDraft] = useState<CareerDraft>(DEFAULT_DRAFT);
  const [loaded, setLoaded] = useState(false);
  const [motion, setMotion] = useState<Motion | null>(null);
  const [trophyRoom, setTrophyRoom] = useState<TrophyRoom>(EMPTY_TROPHY_ROOM);

  useEffect(() => {
    const saved = loadCareer();
    let archive = loadTrophyRoom();
    if (saved) {
      if (saved.player && saved.careerId) archive = mergeCareerSnapshot(archive, saved.careerId, saved.player);
      // Restore once after hydration; the save is deliberately device-local.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGame(saved);
    }
    setTrophyRoom(archive);
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) saveCareer(game); }, [game, loaded]);
  useEffect(() => { if (loaded) saveTrophyRoom(trophyRoom); }, [loaded, trophyRoom]);

  const player = game.player;
  const scenario = game.scenarioId ? SCENARIOS.find((item) => item.id === game.scenarioId) ?? null : null;
  const achievements = player ? careerEngine.achievements(player) : [];
  const trophyTotals = trophyRoomTotals(trophyRoom);

  function showMotion(nextMotion: Motion, action: () => void, delay = 950) {
    setMotion(nextMotion);
    window.setTimeout(() => { action(); setMotion(null); }, delay);
  }
  function applyBeat(beat: CareerBeat) {
    if (beat.type === "summary") {
      setGame((current) => ({ ...current, screen: "summary" }));
      return;
    }
    if (beat.type === "scenario") {
      setGame((current) => ({ ...current, phase: "scenario", scenarioId: beat.scenario.id, outcome: null }));
      return;
    }
    setGame((current) => ({ ...current, phase: "decision", offers: beat.offers, scenarioId: null, outcome: null, decisionKind: beat.kind, decisionTitle: beat.title, decisionDescription: beat.description }));
  }
  function startCareer() {
    const start = careerEngine.createCareer(draft);
    const careerId = newCareerId();
    const world = createWorldState();
    showMotion({ kind: "origin", title: "Drawing your starting route", detail: "Academy prospect, early professional… or something rarer." }, () => {
      setGame((current) => ({ ...current, careerId, screen: "career", phase: "origin-reveal", player: start.player, offers: start.offers, lastSeason: null, scenarioId: null, outcome: null, decisionKind: "first-club", decisionTitle: start.title, decisionDescription: start.description, world }));
      setTrophyRoom((current) => mergeCareerSnapshot(current, careerId, start.player));
    }, 1050);
  }
  function chooseOffer(offer: Offer) {
    if (!player) return;
    const careerId = game.careerId ?? newCareerId();
    const result = careerEngine.simulateSeason(player, offer, game.seasonSpan, game.world);
    const years = result.season.toAge - result.season.fromAge;
    showMotion({ kind: "season", title: years === 1 ? "The season is playing out" : `${years} seasons are playing out`, detail: `${offer.name} · ${offer.role} · form, minutes and fitness are moving.` }, () => {
      setGame((current) => ({ ...current, careerId, screen: "career", phase: "season-result", player: result.player, offers: [], lastSeason: result.season, scenarioId: null, outcome: null, world: result.world }));
      setTrophyRoom((current) => mergeCareerSnapshot(current, careerId, result.player));
    }, 1200);
  }
  function continueAfterSeason() {
    if (player) applyBeat(careerEngine.nextBeat(player, game.lastSeason, game.world));
  }
  function resolveScenario(option: ScenarioOption) {
    if (!player || !scenario) return;
    const careerId = game.careerId ?? newCareerId();
    const result = careerEngine.resolveScenario(player, scenario, option);
    showMotion({ kind: "fate", title: "The outcome is being decided", detail: option.outcomes.map((item) => `${Math.round(item.probability * 100)}% ${item.positive ? "good" : "bad"}`).join(" · ") }, () => {
      setGame((current) => ({ ...current, careerId, phase: "scenario-result", player: result.player, outcome: result.outcome }));
      setTrophyRoom((current) => mergeCareerSnapshot(current, careerId, result.player));
    }, 1150);
  }
  function resetGame() {
    clearCareer();
    setGame(DEFAULT_SAVE);
    setDraft(DEFAULT_DRAFT);
  }

  return (
    <>
      <GlobalStyles />
      <main className="site-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => setGame((current) => ({ ...current, screen: "home" }))} aria-label="Goalbound home"><span className="brand-mark">G</span><span>GOALBOUND</span></button>
        <div className="topbar-right"><span className="save-status"><i /> Saved on this device</span><button className="quiet-button trophy-nav" onClick={() => setGame((current) => ({ ...current, screen: "trophy-room" }))}>Trophy room <b>{trophyTotals.total}</b></button>{player && <button className="quiet-button" onClick={resetGame}>New career</button>}</div>
      </header>
      {motion && <div className="motion-screen" role="status" aria-live="polite"><div className={`motion-card ${motion.kind}`}><span className="motion-ball" /><small>Career in motion</small><h3>{motion.title}</h3><p>{motion.detail}</p><div className="motion-track"><i /><i /><i /></div></div></div>}

      {game.screen === "home" && <HomeScreen player={player} trophyCount={trophyTotals.total} onStart={() => setGame((current) => ({ ...current, screen: "setup" }))} onResume={() => player && setGame((current) => ({ ...current, screen: player.age >= 36 ? "summary" : "career" }))} onTrophyRoom={() => setGame((current) => ({ ...current, screen: "trophy-room" }))} />}
      {game.screen === "setup" && <SetupScreen draft={draft} seasonSpan={game.seasonSpan} onDraftChange={setDraft} onSeasonSpanChange={(seasonSpan) => setGame((current) => ({ ...current, seasonSpan }))} onBack={() => setGame((current) => ({ ...current, screen: "home" }))} onStart={startCareer} />}
      {game.screen === "career" && player && <CareerScreen game={game} player={player} scenario={scenario} achievements={achievements} onSeasonSpanChange={(seasonSpan) => setGame((current) => ({ ...current, seasonSpan }))} onRevealOrigin={() => setGame((current) => ({ ...current, phase: "decision" }))} onOffer={chooseOffer} onContinueSeason={continueAfterSeason} onScenario={resolveScenario} onContinueScenario={() => player && applyBeat(careerEngine.ordinaryDecision(player, game.world))} />}
      {game.screen === "summary" && player && <SummaryScreen player={player} onReset={resetGame} onTrophyRoom={() => setGame((current) => ({ ...current, screen: "trophy-room" }))} />}
      {game.screen === "trophy-room" && <TrophyRoomScreen room={trophyRoom} onBack={() => setGame((current) => ({ ...current, screen: "home" }))} />}

      <footer><span>GOALBOUND © 2026</span><span>Real clubs · Original scenarios · No real player likenesses</span></footer>
      </main>
    </>
  );
}
