import { useMemo, useState } from "react";
import { COUNTRIES, POSITIONS, country } from "../catalog";
import type { CareerDraft } from "../domain";

type SetupScreenProps = {
  draft: CareerDraft;
  seasonSpan: number;
  onDraftChange: (draft: CareerDraft) => void;
  onNationChange: (nation: string) => void;
  onGenerateName: () => void;
  onSeasonSpanChange: (years: number) => void;
  onBack: () => void;
  onStart: () => void;
};

type SetupStep = 1 | 2 | 3;

const SETUP_STEPS = [
  { number: 1 as const, label: "Nation" },
  { number: 2 as const, label: "Identity" },
  { number: 3 as const, label: "Position" },
];

export function SetupScreen({ draft, seasonSpan, onDraftChange, onNationChange, onGenerateName, onSeasonSpanChange, onBack, onStart }: SetupScreenProps) {
  const [step, setStep] = useState<SetupStep>(1);
  const [countryFilter, setCountryFilter] = useState("");
  const playerCountry = country(draft.nation);
  const filteredCountries = useMemo(() => {
    const query = countryFilter.trim().toLocaleLowerCase();
    return query
      ? COUNTRIES.filter((item) => `${item.name} ${item.code}`.toLocaleLowerCase().includes(query))
      : COUNTRIES;
  }, [countryFilter]);
  const hasPlayerName = draft.name.trim().length > 0;

  function chooseNation(code: string) {
    onNationChange(code);
    setStep(2);
  }

  return (
    <section className="setup-page page-enter">
      <div className="page-heading setup-heading"><button className="back-link" onClick={onBack}>← Back</button><span className="eyebrow">New career · Three quick steps</span><h2>Create your player</h2><p>Choose where your story begins, give the prospect an identity, then decide where they play.</p></div>
      <div className="setup-grid">
        <div className="form-panel wizard-panel">
          <nav className="setup-steps" aria-label="Player creation progress">
            {SETUP_STEPS.map((item) => (
              <button type="button" className={step === item.number ? "active" : step > item.number ? "complete" : ""} onClick={() => setStep(item.number)} aria-current={step === item.number ? "step" : undefined} key={item.number}>
                <span>{step > item.number ? "✓" : `0${item.number}`}</span><strong>{item.label}</strong>
              </button>
            ))}
          </nav>

          {step === 1 && (
            <div className="wizard-stage">
              <div className="wizard-stage-heading"><span>Step 1 of 3</span><h3>Choose a football nation</h3><p>This shapes your name pool, home market and the clubs most likely to know you first.</p></div>
              <label className="country-search"><span>Find a nation</span><input type="search" value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} placeholder="Search by country or code" /></label>
              <div className="country-grid compact-country-grid">
                {filteredCountries.map((item) => <button type="button" key={item.code} className={draft.nation === item.code ? "country-option selected" : "country-option"} onClick={() => chooseNation(item.code)} aria-pressed={draft.nation === item.code}><span>{item.flag}</span><strong>{item.name}</strong><small>{item.code}</small></button>)}
              </div>
              {!filteredCountries.length && <p className="wizard-empty">No football nation matches that search.</p>}
              <div className="wizard-actions"><span>{COUNTRIES.length} playable nations</span><button type="button" className="primary-button" onClick={() => setStep(2)}>Continue with {playerCountry.name} <b>→</b></button></div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-stage">
              <div className="wizard-stage-heading"><span>Step 2 of 3</span><h3>Name the prospect</h3><p>The shirt number is yours. The reputation still has to be earned.</p></div>
              <div className="field-grid identity-fields">
                <div className="field"><label htmlFor="player-name">Player name</label><div className="name-field-row"><input id="player-name" value={draft.name} maxLength={22} onChange={(event) => onDraftChange({ ...draft, name: event.target.value })} placeholder="Your name" /><button type="button" className="name-generator" onClick={onGenerateName} aria-label={`Generate another ${playerCountry.name} name`}>↻ New name</button></div></div>
                <label className="field small-field"><span>Shirt number</span><input type="number" min="1" max="99" value={draft.number} onChange={(event) => onDraftChange({ ...draft, number: Math.max(1, Math.min(99, Number(event.target.value))) })} /></label>
              </div>
              <div className="identity-confirmation"><span>{playerCountry.flag}</span><div><small>Representing</small><strong>{playerCountry.name}</strong></div><button type="button" onClick={() => setStep(1)}>Change nation</button></div>
              <div className="wizard-actions"><button type="button" className="secondary-button" onClick={() => setStep(1)}>← Nation</button><button type="button" className="primary-button" disabled={!hasPlayerName} onClick={() => setStep(3)}>Choose position <b>→</b></button></div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-stage">
              <div className="wizard-stage-heading"><span>Step 3 of 3</span><h3>Choose a position</h3><p>Your position changes the minutes, numbers, awards and career curve the game expects from you.</p></div>
              <fieldset className="wizard-fieldset"><legend>Position</legend><div className="position-grid">{POSITIONS.map((item) => <button type="button" key={item} className={draft.position === item ? "position-option selected" : "position-option"} onClick={() => onDraftChange({ ...draft, position: item })} aria-pressed={draft.position === item}>{item}</button>)}</div></fieldset>
              <fieldset className="wizard-fieldset"><legend>Career pace</legend><div className="span-options">{[1, 2, 3].map((years) => <button type="button" key={years} className={seasonSpan === years ? "span-option selected" : "span-option"} onClick={() => onSeasonSpanChange(years)}>{years} {years === 1 ? "season" : "seasons"}</button>)}</div><p className="field-note">One season is the full soap opera. Three seasons is chaos at high speed.</p></fieldset>
              <div className="wizard-actions final"><button type="button" className="secondary-button" onClick={() => setStep(2)}>← Identity</button><button type="button" className="primary-button" disabled={!hasPlayerName} onClick={onStart}>Draw my starting route <b>→</b></button></div>
            </div>
          )}
        </div>
        <aside className="live-card"><div className="live-card-top"><span>PROSPECT ID</span><span>{playerCountry.code} / ???</span></div><div className="live-score"><strong>?</strong><span>STARTING OVR<br />ROUTE: UNKNOWN</span></div><div className="live-shirt"><b>{draft.number}</b><small>{playerCountry.flag}</small></div><div className="live-name">{draft.name || "YOUR NAME"}</div><div className="live-meta"><span><small>NATION</small>{playerCountry.name}</span><span><small>POSITION</small>{draft.position}</span><span><small>STATUS</small>Awaiting scouts</span></div><p className="live-card-note">Complete the three steps to reveal who offers you the first shirt.</p></aside>
      </div>
    </section>
  );
}
