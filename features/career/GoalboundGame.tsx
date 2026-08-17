"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { CareerStore } from "./CareerStore";
import { CareerScreen } from "./components/CareerScreen";
import { HomeScreen } from "./components/HomeScreen";
import { SetupScreen } from "./components/SetupScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { TrophyRoomScreen } from "./components/TrophyRoomScreen";
import { GlobalStyles } from "./styles";

export const GoalboundGame = observer(function GoalboundGame() {
  const [store] = useState(() => new CareerStore());

  useEffect(() => store.startPersistence(), [store]);

  const { game, player, scenario, achievements, canRequestTransfer, trophyTotals, draft, motion, trophyRoom } = store;

  return (
    <>
      <GlobalStyles />
      <main className="site-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <header className="topbar">
          <button className="brand" onClick={() => store.navigate("home")} aria-label="Goalbound home">
            <span className="brand-mark">G</span>
            <span>GOALBOUND</span>
          </button>
          <div className="topbar-right">
            <span className="save-status"><i /> Saved on this device</span>
            <button className="quiet-button trophy-nav" onClick={() => store.navigate("trophy-room")}>
              Trophy room <b>{trophyTotals.total}</b>
            </button>
            {player && <button className="quiet-button" onClick={store.resetGame}>New career</button>}
          </div>
        </header>

        {motion && (
          <div className="motion-screen" role="status" aria-live="polite">
            <div className={`motion-card ${motion.kind}`}>
              <span className="motion-ball" />
              <small>Career in motion</small>
              <h3>{motion.title}</h3>
              <p>{motion.detail}</p>
              <div className="motion-track"><i /><i /><i /></div>
            </div>
          </div>
        )}

        {game.screen === "home" && (
          <HomeScreen
            player={player}
            trophyCount={trophyTotals.total}
            onStart={store.beginCareerSetup}
            onResume={store.resumeCareer}
            onTrophyRoom={() => store.navigate("trophy-room")}
          />
        )}
        {game.screen === "setup" && (
          <SetupScreen
            draft={draft}
            seasonSpan={game.seasonSpan}
            onDraftChange={store.setDraft}
            onNationChange={store.setNation}
            onGenerateName={store.regenerateDraftName}
            onSeasonSpanChange={store.setSeasonSpan}
            onBack={() => store.navigate("home")}
            onStart={store.startCareer}
          />
        )}
        {game.screen === "career" && player && (
          <CareerScreen
            game={game}
            player={player}
            scenario={scenario}
            achievements={achievements}
            canRequestTransfer={canRequestTransfer}
            onSeasonSpanChange={store.setSeasonSpan}
            onRevealOrigin={store.revealOrigin}
            onOffer={store.chooseOffer}
            onRequestTransfer={store.requestTransfer}
            onContinueSeason={store.continueAfterSeason}
            onScenario={store.resolveScenario}
            onContinueScenario={store.continueAfterScenario}
          />
        )}
        {game.screen === "summary" && player && (
          <SummaryScreen
            player={player}
            onReset={store.resetGame}
            onTrophyRoom={() => store.navigate("trophy-room")}
          />
        )}
        {game.screen === "trophy-room" && (
          <TrophyRoomScreen room={trophyRoom} onBack={() => store.navigate("home")} />
        )}

        <footer>
          <span>GOALBOUND © 2026</span>
          <span>Real clubs · Original scenarios · No real player likenesses</span>
        </footer>
      </main>
    </>
  );
});
