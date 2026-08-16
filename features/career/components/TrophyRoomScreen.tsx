import { clubByName, country } from "../catalog";
import type { TrophyRoom } from "../domain";
import { trophyRoomTotals } from "../trophyRoom";
import { ClubBadge } from "./ClubBadge";

export function TrophyRoomScreen({ room, onBack }: { room: TrophyRoom; onBack: () => void }) {
  const totals = trophyRoomTotals(room);
  return (
    <section className="trophy-room-page page-enter">
      <div className="trophy-room-heading">
        <div><span className="eyebrow">All careers · Saved on this device</span><h2>The trophy <em>room.</em></h2><p>Every club you represented and every honour you earned, across every save.</p></div>
        <button className="secondary-button" onClick={onBack}>← Back home</button>
      </div>
      <div className="trophy-room-summary">
        <div><strong>{totals.total}</strong><span>Total honours</span></div>
        <div><strong>{totals.team}</strong><span>Team trophies</span></div>
        <div><strong>{totals.individual}</strong><span>Individual awards</span></div>
        <div><strong>{totals.clubs}</strong><span>Clubs represented</span></div>
      </div>
      {room.careers.length === 0 ? (
        <div className="trophy-room-empty"><span>🏆</span><h3>The shelves are waiting.</h3><p>Play a career and this room will keep the honours, even after you start another one.</p></div>
      ) : (
        <div className="trophy-careers">{room.careers.map((career) => (
          <article className="trophy-career-card" key={career.id}>
            <div className="trophy-career-head"><div><span>{country(career.nation).flag} Career save</span><h3>{career.playerName}</h3><p>Age {career.finalAge} · {career.finalRating} OVR · {career.honours.reduce((sum, honour) => sum + honour.count, 0)} honours</p></div><strong>{career.finalRating}</strong></div>
            <div className="career-club-rail">{career.clubs.length ? career.clubs.map((club) => <span key={club}><ClubBadge club={clubByName(club)} small />{club}</span>) : <small>No senior club yet</small>}</div>
            {career.honours.length ? <div className="trophy-grid">{career.honours.map((honour) => (
              <div className={`trophy-card ${honour.category}`} key={honour.id}><span className="trophy-icon">{honour.icon}</span><div><small>{honour.category} honour · {honour.season}</small><strong>{honour.name}{honour.count > 1 ? ` ×${honour.count}` : ""}</strong><p>{honour.club}</p></div></div>
            ))}</div> : <p className="career-no-honours">No trophies yet. The museum shop remains optimistic.</p>}
          </article>
        ))}</div>
      )}
    </section>
  );
}
