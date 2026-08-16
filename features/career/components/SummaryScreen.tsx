import { country } from "../catalog";
import type { Player } from "../domain";

export function SummaryScreen({ player, onReset, onTrophyRoom }: { player: Player; onReset: () => void; onTrophyRoom: () => void }) {
  return (
    <section className="summary-page page-enter">
      <span className="eyebrow">Career complete · Age {player.age}</span><h2>{player.name}<br /><em>leaves a legacy.</em></h2>
      <p className="summary-lead">From {country(player.nation).name} to the world. {player.history.length} clubs and decisions, several excellent contracts, one suspicious recovery guru.</p>
      <div className="summary-score"><span>FINAL OVR</span><strong>{player.rating}</strong><small>{player.rating >= 90 ? "WORLD ICON" : player.rating >= 82 ? "ELITE CAREER" : player.rating >= 72 ? "PROVEN PROFESSIONAL" : "CULT HERO"}</small></div>
      <div className="summary-stats"><div><strong>{player.totalApps}</strong><span>Apps</span></div><div><strong>{player.totalGoals}</strong><span>Goals</span></div><div><strong>{player.totalAssists}</strong><span>Assists</span></div><div><strong>{player.trophies}</strong><span>Trophies</span></div><div><strong>{player.caps}</strong><span>Caps</span></div></div>
      <div className="summary-actions"><button className="primary-button" onClick={onReset}>Start another career <span>↻</span></button><button className="secondary-button" onClick={onTrophyRoom}>Open trophy room</button></div>
    </section>
  );
}
