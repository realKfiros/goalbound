import { CLUBS, COUNTRIES } from "../catalog";
import type { Player } from "../domain";

export function HomeScreen({ player, trophyCount, onStart, onResume, onTrophyRoom }: { player: Player | null; trophyCount: number; onStart: () => void; onResume: () => void; onTrophyRoom: () => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span>Career simulator</span><span>{CLUBS.length} real clubs</span></div>
          <h1>Your talent.<br /><em>Your choices.</em><br />Your legacy.</h1>
          <p>Start in an academy, a smaller senior side or—very rarely—as the gem everyone wants. Stay loyal or survive the day the club makes the choice for you.</p>
          <div className="hero-actions"><button className="primary-button" onClick={onStart}>Start your career <span>→</span></button>{player && <button className="secondary-button" onClick={onResume}>Resume {player.name}</button>}<button className="secondary-button" onClick={onTrophyRoom}>Trophy room · {trophyCount}</button></div>
          <div className="nation-strip" aria-label={`${COUNTRIES.length} playable nations`}>{COUNTRIES.map((item) => <span key={item.code} title={item.name}>{item.flag}</span>)}</div>
        </div>
        <div className="hero-card-wrap" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="prospect-card"><div className="prospect-top"><span className="rating-big">52</span><div><strong>OVR</strong><span>RISING TALENT</span></div><span className="card-flag">🌍</span></div><div className="shirt-graphic"><span>9</span></div><div className="prospect-name">YOUR NAME</div><div className="card-data"><span>AGE <strong>16</strong></span><span>POS <strong>ST</strong></span><span>VALUE <strong>€125k</strong></span></div></div>
          <div className="floating-tag tag-left"><small>NEXT MOVE</small><strong>YOU DECIDE</strong></div><div className="floating-tag tag-right"><small>OUTCOME</small><strong>FATE DECIDES</strong></div>
        </div>
      </section>
      <section className="manifesto"><div><span className="step-number">01</span><h3>Real football world</h3><p>Every represented division is complete: England&apos;s first five levels, Europe&apos;s major pathways, and full top flights across the Americas, Middle East and Asia.</p></div><div><span className="step-number">02</span><h3>Decisions with teeth</h3><p>See the odds, choose your risk and live with what the football gods decide.</p></div><div><span className="step-number">03</span><h3>A career, not a transfer tour</h3><p>Renew for years, become one-club royalty—or be sold when the balance sheet wins.</p></div></section>
    </>
  );
}
