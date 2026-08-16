"use client";

import { useState } from "react";
import { country } from "../catalog";
import type { TrophyRoom } from "../domain";
import { clubAlbum, representedClubs, trophyCollection, type TrophyCollectionEntry } from "../trophyCollection";
import { trophyRoomTotals } from "../trophyRoom";
import { ClubBadge } from "./ClubBadge";

type CollectionTab = "honours" | "clubs";

function CollectionProgress({ collected, total }: { collected: number; total: number }) {
  return <span className="collection-progress"><strong>{collected}</strong> / {total}</span>;
}

function HonourTile({ entry }: { entry: TrophyCollectionEntry }) {
  const clubs = [...new Set(entry.honours.map((honour) => honour.club))];
  const description = entry.unlocked
    ? [clubs.slice(0, 2).join(", "), entry.honours[0]?.season].filter(Boolean).join(" · ")
    : "Not collected yet";
  return (
    <article className={`collection-tile honour-tile ${entry.category} ${entry.unlocked ? "unlocked" : "locked"}`}>
      <span className="collection-icon" aria-hidden="true">{entry.icon}</span>
      <div>
        <small>{entry.detail}</small>
        <strong>{entry.name}</strong>
        <p>{description}</p>
      </div>
      {entry.count > 1 && <b className="duplicate-count">×{entry.count}</b>}
      {!entry.unlocked && <span className="lock-mark" aria-label="Locked">◇</span>}
    </article>
  );
}

export function TrophyRoomScreen({ room, onBack }: { room: TrophyRoom; onBack: () => void }) {
  const [tab, setTab] = useState<CollectionTab>("honours");
  const [mineOnly, setMineOnly] = useState(false);
  const totals = trophyRoomTotals(room);
  const collection = trophyCollection(room);
  const album = clubAlbum(room);
  const represented = representedClubs(room);
  const collectedHonours = collection.all.filter((entry) => entry.unlocked).length;
  const totalClubs = album.reduce((total, group) => total + group.clubs.length, 0);
  const collectionCount = tab === "honours" ? collectedHonours : represented.size;
  const collectionTotal = tab === "honours" ? collection.all.length : totalClubs;
  const visibleTeam = mineOnly ? collection.team.filter((entry) => entry.unlocked) : collection.team;
  const visibleIndividual = mineOnly ? collection.individual.filter((entry) => entry.unlocked) : collection.individual;
  const visibleAlbum = mineOnly ? album.filter((group) => group.collected > 0) : album;

  function chooseTab(nextTab: CollectionTab) {
    setTab(nextTab);
    setMineOnly(false);
  }

  return (
    <section className="trophy-room-page page-enter">
      <div className="trophy-room-heading">
        <div>
          <span className="eyebrow">All careers · Saved on this device</span>
          <h2>My <em>collection.</em></h2>
          <p>Fill the cabinet, complete the club album and leave absolutely no room for sensible furniture.</p>
        </div>
        <button className="secondary-button" onClick={onBack}>← Back home</button>
      </div>

      <div className="collection-tabs" role="tablist" aria-label="Collection">
        <button className={tab === "honours" ? "active" : ""} role="tab" aria-selected={tab === "honours"} onClick={() => chooseTab("honours")}>
          <span>🏆</span><div><small>Trophy cabinet</small><strong>{collectedHonours} / {collection.all.length}</strong></div>
        </button>
        <button className={tab === "clubs" ? "active" : ""} role="tab" aria-selected={tab === "clubs"} onClick={() => chooseTab("clubs")}>
          <span>🛡️</span><div><small>Club album</small><strong>{represented.size} / {totalClubs}</strong></div>
        </button>
      </div>

      <div className="collection-toolbar">
        <div><span>{tab === "honours" ? "Honours collected" : "Clubs represented"}</span><CollectionProgress collected={collectionCount} total={collectionTotal} /></div>
        <button className={mineOnly ? "active" : ""} aria-pressed={mineOnly} onClick={() => setMineOnly((current) => !current)}>
          {mineOnly ? "Show full collection" : tab === "honours" ? "My honours only" : "My clubs only"}
        </button>
      </div>

      {tab === "honours" ? (
        <div className="collection-cabinet" role="tabpanel">
          <section className="collection-section">
            <header><div><span>01</span><h3>Team trophies</h3></div><CollectionProgress collected={collection.team.filter((entry) => entry.unlocked).length} total={collection.team.length} /></header>
            {visibleTeam.length
              ? <div className="collection-grid">{visibleTeam.map((entry) => <HonourTile entry={entry} key={entry.id} />)}</div>
              : <div className="collection-filter-empty">No team trophies yet. The engraver has stopped checking their inbox.</div>}
          </section>
          <section className="collection-section">
            <header><div><span>02</span><h3>Individual awards</h3></div><CollectionProgress collected={collection.individual.filter((entry) => entry.unlocked).length} total={collection.individual.length} /></header>
            {visibleIndividual.length
              ? <div className="collection-grid">{visibleIndividual.map((entry) => <HonourTile entry={entry} key={entry.id} />)}</div>
              : <div className="collection-filter-empty">No individual awards yet. Your agent still describes this as “brand building.”</div>}
          </section>
        </div>
      ) : (
        <div className="club-album" role="tabpanel">
          <div className="badge-source-note"><span>Real club badges load via football-data.org and TheSportsDB where there is an exact match.</span><small>Otherwise Goalbound keeps the club-colour monogram.</small></div>
          {visibleAlbum.length ? visibleAlbum.map((group) => {
            const visibleClubs = (mineOnly ? group.clubs.filter((club) => represented.has(club.name)) : [...group.clubs])
              .sort((a, b) => Number(represented.has(b.name)) - Number(represented.has(a.name)));
            return (
              <section className="album-league" key={group.id}>
                <header>
                  <div><span>{country(group.country).flag}</span><div><small>{country(group.country).name} · Division {group.division}</small><h3>{group.league}</h3></div></div>
                  <CollectionProgress collected={group.collected} total={group.clubs.length} />
                </header>
                <div className="club-album-grid">{visibleClubs.map((club) => {
                  const collected = represented.has(club.name);
                  const careerCount = room.careers.filter((career) => career.clubs.includes(club.name)).length;
                  return (
                    <article className={`club-album-card ${collected ? "unlocked" : "locked"}`} key={`${club.country}:${club.name}`}>
                      <ClubBadge club={club} fetchRemote={collected} locked={!collected} />
                      <strong>{club.name}</strong>
                      <small>{collected ? `${careerCount} career${careerCount === 1 ? "" : "s"}` : "Not collected"}</small>
                    </article>
                  );
                })}</div>
              </section>
            );
          }) : <div className="collection-filter-empty">No clubs collected yet. Even the kit person has forgotten your name.</div>}
        </div>
      )}

      {!!room.careers.length && (
        <details className="career-archive">
          <summary><span>Career save archive</span><small>{room.careers.length} save{room.careers.length === 1 ? "" : "s"} · {totals.total} honours</small></summary>
          <div className="career-archive-grid">{room.careers.map((career) => (
            <article key={career.id}>
              <span>{country(career.nation).flag}</span>
              <div><strong>{career.playerName}</strong><small>Age {career.finalAge} · {career.finalRating} OVR · {career.clubs.length} clubs</small></div>
              <b>{career.honours.reduce((sum, honour) => sum + honour.count, 0)}</b>
            </article>
          ))}</div>
        </details>
      )}
    </section>
  );
}
