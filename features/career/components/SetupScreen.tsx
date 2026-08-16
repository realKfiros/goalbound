import { COUNTRIES, POSITIONS, country } from "../catalog";
import type { CareerDraft } from "../domain";

type SetupScreenProps = {
  draft: CareerDraft;
  seasonSpan: number;
  onDraftChange: (draft: CareerDraft) => void;
  onSeasonSpanChange: (years: number) => void;
  onBack: () => void;
  onStart: () => void;
};

export function SetupScreen({ draft, seasonSpan, onDraftChange, onSeasonSpanChange, onBack, onStart }: SetupScreenProps) {
  const playerCountry = country(draft.nation);
  return (
    <section className="setup-page page-enter">
      <div className="page-heading"><button className="back-link" onClick={onBack}>← Back</button><span className="eyebrow">New career · Unknown route</span><h2>Create your player</h2><p>Most players begin in an academy. Some go straight into senior football. A rare few arrive with everybody already watching.</p></div>
      <div className="setup-grid">
        <div className="form-panel">
          <div className="field-grid"><label className="field"><span>Player name</span><input value={draft.name} maxLength={22} onChange={(event) => onDraftChange({ ...draft, name: event.target.value })} placeholder="Your name" /></label><label className="field small-field"><span>Shirt number</span><input type="number" min="1" max="99" value={draft.number} onChange={(event) => onDraftChange({ ...draft, number: Math.max(1, Math.min(99, Number(event.target.value))) })} /></label></div>
          <fieldset><legend>Nationality · {COUNTRIES.length} playable nations</legend><div className="country-grid">{COUNTRIES.map((item) => <button key={item.code} className={draft.nation === item.code ? "country-option selected" : "country-option"} onClick={() => onDraftChange({ ...draft, nation: item.code })} aria-pressed={draft.nation === item.code}><span>{item.flag}</span><strong>{item.name}</strong><small>{item.code}</small></button>)}</div></fieldset>
          <fieldset><legend>Position</legend><div className="position-grid">{POSITIONS.map((item) => <button key={item} className={draft.position === item ? "position-option selected" : "position-option"} onClick={() => onDraftChange({ ...draft, position: item })} aria-pressed={draft.position === item}>{item}</button>)}</div></fieldset>
          <fieldset><legend>Decisions every</legend><div className="span-options">{[1, 2, 3].map((years) => <button key={years} className={seasonSpan === years ? "span-option selected" : "span-option"} onClick={() => onSeasonSpanChange(years)}>{years} {years === 1 ? "season" : "seasons"}</button>)}</div><p className="field-note">One season is the full soap opera. Three seasons is chaos at high speed.</p></fieldset>
        </div>
        <aside className="live-card"><div className="live-card-top"><span>PROSPECT ID</span><span>{playerCountry.code} / ???</span></div><div className="live-score"><strong>?</strong><span>STARTING OVR<br />ROUTE: UNKNOWN</span></div><div className="live-shirt"><b>{draft.number}</b><small>{playerCountry.flag}</small></div><div className="live-name">{draft.name || "YOUR NAME"}</div><div className="live-meta"><span><small>NATION</small>{playerCountry.name}</span><span><small>POSITION</small>{draft.position}</span><span><small>STATUS</small>Awaiting scouts</span></div><button className="primary-button full-button" onClick={onStart}>Draw my starting route <span>→</span></button></aside>
      </div>
    </section>
  );
}
