"use client";

import { useEffect, useMemo, useState } from "react";

type Screen = "home" | "setup" | "career" | "summary";
type Role = "Prospect" | "Rotation" | "Starter" | "Star";

type Country = {
  code: string;
  name: string;
  flag: string;
};

type Club = {
  name: string;
  country: string;
  level: number;
  development: number;
  identity: string;
};

type Offer = Club & {
  role: Role;
  label: string;
};

type Season = {
  fromAge: number;
  toAge: number;
  club: string;
  country: string;
  role: Role;
  apps: number;
  goals: number;
  assists: number;
  before: number;
  after: number;
  trophies: number;
  event: string;
};

type Player = {
  name: string;
  nation: string;
  position: string;
  number: number;
  age: number;
  rating: number;
  value: number;
  currentClub: string;
  totalApps: number;
  totalGoals: number;
  totalAssists: number;
  trophies: number;
  caps: number;
  nationalGoals: number;
  history: Season[];
};

type SavedGame = {
  screen: Screen;
  player: Player | null;
  offers: Offer[];
  seasonSpan: number;
};

const COUNTRIES: Country[] = [
  { code: "ENG", name: "England", flag: "🇬🇧" },
  { code: "ESP", name: "Spain", flag: "🇪🇸" },
  { code: "GER", name: "Germany", flag: "🇩🇪" },
  { code: "ITA", name: "Italy", flag: "🇮🇹" },
  { code: "FRA", name: "France", flag: "🇫🇷" },
  { code: "POR", name: "Portugal", flag: "🇵🇹" },
  { code: "NED", name: "Netherlands", flag: "🇳🇱" },
  { code: "BRA", name: "Brazil", flag: "🇧🇷" },
  { code: "ARG", name: "Argentina", flag: "🇦🇷" },
  { code: "USA", name: "United States", flag: "🇺🇸" },
];

const POSITIONS = ["LW", "ST", "RW", "CAM", "CM", "CDM", "LB", "CB", "RB", "GK"];

const CLUBS: Club[] = [
  { name: "Northbridge FC", country: "ENG", level: 3, development: 4, identity: "High-tempo football" },
  { name: "Kingsport Athletic", country: "ENG", level: 4, development: 3, identity: "Relentless pressing" },
  { name: "Albion Rovers", country: "ENG", level: 5, development: 3, identity: "Title contenders" },
  { name: "Iberia Sporting", country: "ESP", level: 3, development: 5, identity: "Technical academy" },
  { name: "Costa Roja", country: "ESP", level: 4, development: 4, identity: "Possession first" },
  { name: "Madrid Unión", country: "ESP", level: 5, development: 2, identity: "Global powerhouse" },
  { name: "Rhein Adler", country: "GER", level: 3, development: 5, identity: "Youth specialists" },
  { name: "Berlin 09", country: "GER", level: 4, development: 4, identity: "Direct and fearless" },
  { name: "Bavaria Nord", country: "GER", level: 5, development: 3, identity: "Winning machine" },
  { name: "Torino Aurora", country: "ITA", level: 3, development: 4, identity: "Tactical discipline" },
  { name: "Milano Verde", country: "ITA", level: 4, development: 3, identity: "Counter-attacking" },
  { name: "Roma Capitale", country: "ITA", level: 5, development: 3, identity: "Big-stage pressure" },
  { name: "Paris Étoile", country: "FRA", level: 5, development: 3, identity: "Superstar project" },
  { name: "Lyon Croix", country: "FRA", level: 4, development: 5, identity: "Elite development" },
  { name: "Marseille Sud", country: "FRA", level: 3, development: 4, identity: "Electric atmosphere" },
  { name: "Lisboa Navegadores", country: "POR", level: 4, development: 5, identity: "Talent factory" },
  { name: "Porto Atlântico", country: "POR", level: 3, development: 5, identity: "European launchpad" },
  { name: "Amsterdam Oranje", country: "NED", level: 4, development: 5, identity: "Total football" },
  { name: "Rotterdam Haven", country: "NED", level: 3, development: 5, identity: "Academy pathway" },
  { name: "São Paulo Estrela", country: "BRA", level: 4, development: 5, identity: "Creative freedom" },
  { name: "Rio Carioca", country: "BRA", level: 3, development: 4, identity: "Flair and intensity" },
  { name: "Buenos Aires Azul", country: "ARG", level: 4, development: 5, identity: "Fearless football" },
  { name: "Córdoba Unido", country: "ARG", level: 3, development: 4, identity: "Local heroes" },
  { name: "Pacific City SC", country: "USA", level: 3, development: 4, identity: "Modern project" },
  { name: "New York Borough", country: "USA", level: 4, development: 3, identity: "Big-market ambition" },
];

const DEFAULT_SAVE: SavedGame = {
  screen: "home",
  player: null,
  offers: [],
  seasonSpan: 1,
};

const ROLE_SCORE: Record<Role, number> = {
  Prospect: 1,
  Rotation: 2,
  Starter: 3,
  Star: 4,
};

function country(code: string) {
  return COUNTRIES.find((item) => item.code === code) ?? COUNTRIES[0];
}

function money(value: number) {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m`;
  return `€${Math.round(value / 1_000)}k`;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function roleFor(rating: number, clubLevel: number, age: number): Role {
  const required = 52 + clubLevel * 8;
  if (age <= 17) return clubLevel <= 3 ? "Starter" : "Prospect";
  if (rating >= required + 8) return "Star";
  if (rating >= required) return "Starter";
  if (rating >= required - 7) return "Rotation";
  return "Prospect";
}

function buildOffers(player: Player, first = false): Offer[] {
  const current = CLUBS.find((item) => item.name === player.currentClub);
  let pool = CLUBS.filter((club) => club.name !== player.currentClub);

  if (first) {
    const domestic = pool.filter((club) => club.country === player.nation);
    const localPool = domestic.length >= 3 ? domestic : [...domestic, ...pool];
    return shuffle(localPool)
      .slice(0, 3)
      .map((club) => ({ ...club, role: roleFor(player.rating + 8, club.level, player.age), label: "Academy pathway" }));
  }

  const idealLevel = Math.max(1, Math.min(5, Math.round((player.rating - 48) / 8)));
  pool = pool.filter((club) => Math.abs(club.level - idealLevel) <= 2);

  const picked = shuffle(pool).slice(0, current ? 2 : 3);
  const options: Offer[] = picked.map((club) => ({
    ...club,
    role: roleFor(player.rating, club.level, player.age),
    label: club.country === player.nation ? "Domestic move" : "Move abroad",
  }));

  if (current) {
    options.unshift({
      ...current,
      role: roleFor(player.rating + 2, current.level, player.age),
      label: "Stay and build",
    });
  }

  return options.slice(0, 3);
}

function getAchievements(player: Player) {
  const list = ["Pro debut"];
  const nations = new Set(player.history.map((season) => season.country));
  if (nations.size >= 3) list.push("World traveller");
  if (player.totalApps >= 100) list.push("Centurion");
  if (player.totalGoals >= 100) list.push("Century of goals");
  if (player.trophies >= 3) list.push("Serial winner");
  if (player.caps >= 25) list.push("National icon");
  if (player.rating >= 90) list.push("World class");
  return list;
}

export default function Home() {
  const [game, setGame] = useState<SavedGame>(DEFAULT_SAVE);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("Kai Nash");
  const [nation, setNation] = useState("ENG");
  const [position, setPosition] = useState("ST");
  const [number, setNumber] = useState(9);

  useEffect(() => {
    const saved = window.localStorage.getItem("goalbound-career");
    if (saved) {
      try {
        setGame(JSON.parse(saved) as SavedGame);
      } catch {
        window.localStorage.removeItem("goalbound-career");
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem("goalbound-career", JSON.stringify(game));
  }, [game, loaded]);

  const playerCountry = useMemo(
    () => country(game.player?.nation ?? nation),
    [game.player?.nation, nation],
  );

  function startSetup() {
    setGame((current) => ({ ...current, screen: "setup" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startCareer() {
    const cleanName = name.trim() || "Kai Nash";
    const player: Player = {
      name: cleanName,
      nation,
      position,
      number,
      age: 16,
      rating: 52,
      value: 125_000,
      currentClub: "Free agent",
      totalApps: 0,
      totalGoals: 0,
      totalAssists: 0,
      trophies: 0,
      caps: 0,
      nationalGoals: 0,
      history: [],
    };

    setGame((current) => ({
      ...current,
      screen: "career",
      player,
      offers: buildOffers(player, true),
    }));
  }

  function chooseOffer(offer: Offer) {
    if (!game.player) return;

    const p = game.player;
    const years = Math.min(game.seasonSpan, 36 - p.age);
    const roleScore = ROLE_SCORE[offer.role];
    const apps = Math.max(3, years * randomInt(8 + roleScore * 6, 16 + roleScore * 8));
    const attackFactor = ["ST", "LW", "RW"].includes(p.position) ? 1 : ["CAM", "CM"].includes(p.position) ? 0.55 : 0.18;
    const goals = Math.round(apps * attackFactor * randomInt(9, 19) / 100);
    const assists = Math.round(apps * (["CAM", "LW", "RW", "CM"].includes(p.position) ? 0.18 : 0.08));
    const ageGrowth = p.age < 21 ? 7 : p.age < 25 ? 4 : p.age < 29 ? 2 : p.age < 33 ? 0 : -2;
    const growth = Math.round((ageGrowth + offer.development + roleScore - 3) * Math.sqrt(years));
    const nextRating = Math.max(48, Math.min(96, p.rating + growth));
    const trophyChance = offer.level * roleScore + Math.max(0, nextRating - 78);
    const trophies = trophyChance > randomInt(18, 38) ? 1 : 0;
    const getsCaps = nextRating >= 76 || (nextRating >= 70 && p.nation === "USA");
    const caps = getsCaps ? years * randomInt(3, 9) : 0;
    const nationalGoals = Math.round(caps * attackFactor * 0.2);
    const events = [
      "Became a fan favourite",
      "Earned the manager’s trust",
      "Delivered a breakout campaign",
      "Adapted to a new football culture",
      "Finished the season in strong form",
    ];
    const event = trophies ? "Lifted silverware" : events[randomInt(0, events.length - 1)];
    const season: Season = {
      fromAge: p.age,
      toAge: p.age + years,
      club: offer.name,
      country: offer.country,
      role: offer.role,
      apps,
      goals,
      assists,
      before: p.rating,
      after: nextRating,
      trophies,
      event,
    };
    const next: Player = {
      ...p,
      age: p.age + years,
      rating: nextRating,
      value: Math.round(Math.max(90_000, (nextRating - 45) ** 3 * 290 * (p.age < 30 ? 1 : 0.6))),
      currentClub: offer.name,
      totalApps: p.totalApps + apps,
      totalGoals: p.totalGoals + goals,
      totalAssists: p.totalAssists + assists,
      trophies: p.trophies + trophies,
      caps: p.caps + caps,
      nationalGoals: p.nationalGoals + nationalGoals,
      history: [season, ...p.history],
    };

    setGame((current) => ({
      ...current,
      screen: next.age >= 36 ? "summary" : "career",
      player: next,
      offers: next.age >= 36 ? [] : buildOffers(next),
    }));
  }

  function resetGame() {
    window.localStorage.removeItem("goalbound-career");
    setGame(DEFAULT_SAVE);
    setName("Kai Nash");
    setNation("ENG");
    setPosition("ST");
    setNumber(9);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const player = game.player;
  const achievements = player ? getAchievements(player) : [];

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <button className="brand" onClick={() => setGame((current) => ({ ...current, screen: "home" }))} aria-label="Goalbound home">
          <span className="brand-mark">G</span>
          <span>GOALBOUND</span>
        </button>
        <div className="topbar-right">
          <span className="save-status"><i /> Saved on this device</span>
          {player && <button className="quiet-button" onClick={resetGame}>New career</button>}
        </div>
      </header>

      {game.screen === "home" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><span>Career simulator</span><span>10 nations</span></div>
              <h1>Your talent.<br /><em>Your choices.</em><br />Your legacy.</h1>
              <p>Start at 16. Earn your minutes. Cross borders. Chase trophies. One career, shaped by every decision.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={startSetup}>Start your career <span>→</span></button>
                {player && <button className="secondary-button" onClick={() => setGame((current) => ({ ...current, screen: player.age >= 36 ? "summary" : "career" }))}>Resume {player.name}</button>}
              </div>
              <div className="nation-strip" aria-label="Available nations">
                {COUNTRIES.map((item) => <span key={item.code} title={item.name}>{item.flag}</span>)}
              </div>
            </div>

            <div className="hero-card-wrap" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="prospect-card">
                <div className="prospect-top">
                  <span className="rating-big">52</span>
                  <div><strong>OVR</strong><span>RISING TALENT</span></div>
                  <span className="card-flag">🌍</span>
                </div>
                <div className="shirt-graphic"><span>9</span></div>
                <div className="prospect-name">YOUR NAME</div>
                <div className="card-data"><span>AGE <strong>16</strong></span><span>POS <strong>ST</strong></span><span>VALUE <strong>€125k</strong></span></div>
              </div>
              <div className="floating-tag tag-left"><small>NEXT MOVE</small><strong>YOU DECIDE</strong></div>
              <div className="floating-tag tag-right"><small>POTENTIAL</small><strong>UNKNOWN</strong></div>
            </div>
          </section>

          <section className="manifesto">
            <div><span className="step-number">01</span><h3>Choose your roots</h3><p>Begin in one of ten football cultures, from Buenos Aires to Berlin.</p></div>
            <div><span className="step-number">02</span><h3>Make the move</h3><p>Balance playing time, development, ambition and life abroad.</p></div>
            <div><span className="step-number">03</span><h3>Build a legacy</h3><p>Every season becomes part of a career that is uniquely yours.</p></div>
          </section>
        </>
      )}

      {game.screen === "setup" && (
        <section className="setup-page page-enter">
          <div className="page-heading">
            <button className="back-link" onClick={() => setGame((current) => ({ ...current, screen: "home" }))}>← Back</button>
            <span className="eyebrow">New career · Age 16</span>
            <h2>Create your player</h2>
            <p>This is where the story starts. The rest is earned.</p>
          </div>

          <div className="setup-grid">
            <div className="form-panel">
              <div className="field-grid">
                <label className="field"><span>Player name</span><input value={name} maxLength={22} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
                <label className="field small-field"><span>Shirt number</span><input type="number" min="1" max="99" value={number} onChange={(event) => setNumber(Math.max(1, Math.min(99, Number(event.target.value))))} /></label>
              </div>

              <fieldset>
                <legend>Nationality</legend>
                <div className="country-grid">
                  {COUNTRIES.map((item) => (
                    <button key={item.code} className={nation === item.code ? "country-option selected" : "country-option"} onClick={() => setNation(item.code)} aria-pressed={nation === item.code}>
                      <span>{item.flag}</span><strong>{item.name}</strong><small>{item.code}</small>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Position</legend>
                <div className="position-grid">
                  {POSITIONS.map((item) => <button key={item} className={position === item ? "position-option selected" : "position-option"} onClick={() => setPosition(item)} aria-pressed={position === item}>{item}</button>)}
                </div>
              </fieldset>

              <fieldset>
                <legend>Decisions every</legend>
                <div className="span-options">
                  {[1, 2, 3].map((years) => <button key={years} className={game.seasonSpan === years ? "span-option selected" : "span-option"} onClick={() => setGame((current) => ({ ...current, seasonSpan: years }))}>{years} {years === 1 ? "season" : "seasons"}</button>)}
                </div>
                <p className="field-note">Shorter intervals mean more control. Longer intervals create bigger swings.</p>
              </fieldset>
            </div>

            <aside className="live-card">
              <div className="live-card-top"><span>PROSPECT ID</span><span>{playerCountry.code} / 016</span></div>
              <div className="live-score"><strong>52</strong><span>OVR<br />POTENTIAL: ?</span></div>
              <div className="live-shirt"><b>{number}</b><small>{playerCountry.flag}</small></div>
              <div className="live-name">{name || "YOUR NAME"}</div>
              <div className="live-meta"><span><small>NATION</small>{playerCountry.name}</span><span><small>POSITION</small>{position}</span><span><small>STATUS</small>Free agent</span></div>
              <button className="primary-button full-button" onClick={startCareer}>Enter the football world <span>→</span></button>
            </aside>
          </div>
        </section>
      )}

      {game.screen === "career" && player && (
        <section className="career-page page-enter">
          <div className="career-head">
            <div className="identity-block">
              <div className="mini-shirt">{player.number}</div>
              <div><span className="eyebrow">{playerCountry.flag} {playerCountry.name} · #{player.number} {player.position}</span><h2>{player.name}</h2><p>{player.currentClub} · Age {player.age}</p></div>
            </div>
            <div className="rating-block"><strong>{player.rating}</strong><span>OVR</span></div>
          </div>

          <div className="career-stats">
            <div><small>Market value</small><strong>{money(player.value)}</strong></div>
            <div><small>Appearances</small><strong>{player.totalApps}</strong></div>
            <div><small>Goals</small><strong>{player.totalGoals}</strong></div>
            <div><small>Assists</small><strong>{player.totalAssists}</strong></div>
            <div><small>Trophies</small><strong>{player.trophies}</strong></div>
            <div><small>National caps</small><strong>{player.caps}</strong></div>
          </div>

          {player.history[0] && (
            <div className="latest-season">
              <span className="latest-kicker">Latest chapter</span>
              <strong>{player.history[0].event}</strong>
              <span>{player.history[0].club} · {player.history[0].apps} apps · {player.history[0].goals} goals · {player.history[0].before} → {player.history[0].after} OVR</span>
            </div>
          )}

          <div className="decision-heading">
            <div><span className="eyebrow">The next decision</span><h3>{player.age === 16 ? "Choose your first academy" : "Where do you go next?"}</h3></div>
            <div className="season-control"><span>Simulate</span>{[1, 2, 3].map((years) => <button key={years} className={game.seasonSpan === years ? "active" : ""} onClick={() => setGame((current) => ({ ...current, seasonSpan: years }))}>{years}Y</button>)}</div>
          </div>

          <div className="offers-grid">
            {game.offers.map((offer, index) => {
              const offerCountry = country(offer.country);
              return (
                <button className="offer-card" key={`${offer.name}-${index}`} onClick={() => chooseOffer(offer)}>
                  <div className="offer-index">0{index + 1}</div>
                  <div className="offer-top"><span>{offer.label}</span><span className="offer-flag">{offerCountry.flag}</span></div>
                  <h4>{offer.name}</h4>
                  <p>{offerCountry.name} · Level {offer.level}</p>
                  <div className="offer-details"><span><small>ROLE</small>{offer.role}</span><span><small>IDENTITY</small>{offer.identity}</span></div>
                  <div className="offer-action"><span>Choose club</span><strong>→</strong></div>
                </button>
              );
            })}
          </div>

          <div className="career-lower">
            <div className="timeline-panel">
              <div className="panel-heading"><h3>Career path</h3><span>{player.history.length} chapters</span></div>
              {player.history.length === 0 ? <p className="empty-state">Your first contract will start the timeline.</p> : (
                <div className="timeline">
                  {player.history.map((season, index) => (
                    <div className="timeline-row" key={`${season.club}-${season.fromAge}-${index}`}>
                      <span className="timeline-age">{season.fromAge}–{season.toAge}</span>
                      <span className="timeline-flag">{country(season.country).flag}</span>
                      <div><strong>{season.club}</strong><small>{season.role} · {season.apps} apps · {season.goals} G · {season.assists} A</small></div>
                      <span className={season.after >= season.before ? "rating-rise" : "rating-fall"}>{season.before} → {season.after}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="achievements-panel">
              <div className="panel-heading"><h3>Legacy</h3><span>{achievements.length}/7</span></div>
              <div className="achievement-list">{achievements.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong></div>)}</div>
            </aside>
          </div>
        </section>
      )}

      {game.screen === "summary" && player && (
        <section className="summary-page page-enter">
          <span className="eyebrow">Career complete · Age {player.age}</span>
          <h2>{player.name}<br /><em>leaves a legacy.</em></h2>
          <p className="summary-lead">From {country(player.nation).name} to the world. One career, {player.history.length} defining decisions.</p>
          <div className="summary-score"><span>FINAL OVR</span><strong>{player.rating}</strong><small>{player.rating >= 90 ? "WORLD ICON" : player.rating >= 82 ? "ELITE CAREER" : player.rating >= 72 ? "PROVEN PROFESSIONAL" : "CULT HERO"}</small></div>
          <div className="summary-stats">
            <div><strong>{player.totalApps}</strong><span>Apps</span></div><div><strong>{player.totalGoals}</strong><span>Goals</span></div><div><strong>{player.totalAssists}</strong><span>Assists</span></div><div><strong>{player.trophies}</strong><span>Trophies</span></div><div><strong>{player.caps}</strong><span>Caps</span></div>
          </div>
          <div className="summary-actions"><button className="primary-button" onClick={resetGame}>Start another career <span>↻</span></button><button className="secondary-button" onClick={() => setGame((current) => ({ ...current, screen: "career" }))}>View full timeline</button></div>
        </section>
      )}

      <footer>
        <span>GOALBOUND © 2026</span>
        <span>A fictional football world. No official club marks used.</span>
      </footer>
    </main>
  );
}
