"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { agentProfile, type AgentOption } from "../agents";
import { clubByName, country } from "../catalog";
import type { AnnualHonours, ContinentalCompetition, Offer, Player, PlayoffBracket, SavedGame, Scenario, ScenarioOption, StandingGroup } from "../domain";
import { europeanSeasonFocus, leagueSeasonFocus } from "../seasonSummary";
import { ClubBadge } from "./ClubBadge";

type CareerScreenProps = {
  game: SavedGame;
  player: Player;
  scenario: Scenario | null;
  achievements: string[];
  canRequestTransfer: boolean;
  canReviewAgent: boolean;
  agentOptions: AgentOption[];
  onSeasonSpanChange: (years: number) => void;
  onRevealOrigin: () => void;
  onOffer: (offer: Offer) => void;
  onRequestTransfer: () => void;
  onAgentReview: () => void;
  onAgentChoice: (name: string) => void;
  onContinueSeason: () => void;
  onScenario: (option: ScenarioOption) => void;
  onContinueScenario: () => void;
};

function formatMoney(value: number) {
  return value >= 1_000_000
    ? `€${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m`
    : `€${Math.round(value / 1_000)}k`;
}

const EUROPEAN_MARKERS = {
  "champions-league": { label: "CL", title: "Champions League qualification", className: "cl" },
  "europa-league": { label: "EL", title: "Europa League qualification", className: "el" },
  "conference-league": { label: "ECL", title: "Conference League qualification", className: "ecl" },
} as const;

function StandingTable({ group, annual, activeClub, activeCountry }: {
  group: StandingGroup;
  annual: AnnualHonours;
  activeClub: string;
  activeCountry: string;
}) {
  return (
    <div className="standing-group">
      <h5>{group.name}</h5>
      <div className="standing-rows">
        {group.clubs.map((club, index) => {
          const movement = annual.movements?.find((item) => item.club === club && item.fromLeague === annual.league);
          const isChampion = (annual.titles ?? [{ name: "Champion", winner: annual.champion }]).some((title) => title.winner === club);
          const europeanEntrant = annual.nextSeasonEuropeanQualification?.find((entrant) =>
            entrant.club === club && entrant.country === activeCountry,
          );
          const markerDefinition = europeanEntrant ? EUROPEAN_MARKERS[europeanEntrant.competition] : null;
          const europeanMarker = markerDefinition ? {
            ...markerDefinition,
            title: `Projected next season · ${europeanEntrant.entryRound} · ${europeanEntrant.path}${europeanEntrant.qualifiedVia ? ` · ${europeanEntrant.qualifiedVia}` : ""}`,
          } : null;
          const wonCups = (annual.cupRoll ?? [{ country: activeCountry, ...annual.cup }])
            .filter((cup) => cup.country === activeCountry && cup.winner === club);
          const markers = [
            isChampion ? { label: "C", title: "League champion", className: "c" } : null,
            wonCups.length ? { label: "CW", title: wonCups.map((cup) => `${cup.name} winner`).join(" · "), className: "cw" } : null,
            europeanMarker,
            movement?.direction === "promoted" ? { label: "P", title: "Promoted", className: "p" } : null,
            movement?.direction === "relegated" ? { label: "R", title: "Relegated", className: "r" } : null,
          ].filter((marker): marker is { label: string; title: string; className: string } => !!marker);
          return (
            <div className={club === activeClub ? "standing-row active" : "standing-row"} key={club}>
              <span className="standing-position">{index + 1}</span>
              <ClubBadge club={clubByName(club)} small fetchRemote={false} />
              <strong>{club}</strong>
              <span className="standing-markers">{markers.map((marker) => <span className={`standing-marker ${marker.className}`} title={marker.title} key={marker.className}>{marker.label}</span>)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StandingLegend() {
  return <div className="standing-legend"><span><b className="c">C</b> Champion</span><span><b className="cw">CW</b> Cup winner</span><span><b className="cl">CL</b> Next-season Champions League</span><span><b className="el">EL</b> Next-season Europa League</span><span><b className="ecl">ECL</b> Next-season Conference League</span><span><b className="p">P</b> Promoted</span><span><b className="r">R</b> Relegated</span></div>;
}

function PlayoffBracketView({ bracket, activeClub }: { bracket: PlayoffBracket; activeClub: string }) {
  const rounds = [...new Set(bracket.ties.map((tie) => tie.round))];
  return (
    <div className="playoff-bracket">
      <div className="playoff-bracket-heading"><h5>{bracket.name}</h5><small>{bracket.competition}</small></div>
      <div className="playoff-rounds">
        {rounds.map((round) => (
          <div className="playoff-round" key={round}>
            <span>{round}</span>
            {bracket.ties.filter((tie) => tie.round === round).map((tie, index) => (
              <div className="playoff-tie" key={`${round}-${tie.home}-${tie.away}-${index}`}>
                {[tie.home, tie.away].map((club) => (
                  <div className={`${club === tie.winner ? "winner" : ""} ${club === activeClub ? "active" : ""}`} key={club}>
                    <strong>{club}</strong>{club === tie.winner && <b>›</b>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContinentalTable({ competition, activeClub, activeCountry }: {
  competition: ContinentalCompetition;
  activeClub: string;
  activeCountry: string;
}) {
  return (
    <div className="continental-table-wrap">
      <div className="continental-table-labels"><span>#</span><span>Club</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span><span>Route</span></div>
      <div className="continental-table">
        {competition.table.map((standing, index) => {
          const route = index < 8 ? "R16" : index < 24 ? "PO" : "OUT";
          const isActive = standing.club === activeClub && standing.country === activeCountry;
          return (
            <div className={isActive ? "continental-standing-row active" : "continental-standing-row"} key={`${standing.country}:${standing.club}`} title={standing.qualifiedVia ? `Qualified via: ${standing.qualifiedVia}` : undefined}>
              <span className="standing-position">{index + 1}</span>
              <div className="continental-club"><ClubBadge club={clubByName(standing.club)} small fetchRemote={false} /><strong>{standing.club}</strong><small>{country(standing.country).flag}</small></div>
              <span>{standing.played}</span><span>{standing.won}</span><span>{standing.drawn}</span><span>{standing.lost}</span>
              <span>{standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}</span><b>{standing.points}</b>
              <em className={`continental-route ${route.toLowerCase()}`}>{route}</em>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SeasonDetailKind = "league" | "europe";

function enteredEuropeanCompetition(competition: ContinentalCompetition, activeClub: string, activeCountry: string) {
  return competition.entrants.some((club) => club.club === activeClub && club.country === activeCountry)
    || competition.table.some((club) => club.club === activeClub && club.country === activeCountry)
    || competition.qualifyingBrackets.some((bracket) => bracket.ties.some((tie) => tie.home === activeClub || tie.away === activeClub))
    || competition.bracket.ties.some((tie) => tie.home === activeClub || tie.away === activeClub);
}

function SeasonDetailDialog({ kind, annual, activeClub, activeCountry, onClose }: {
  kind: SeasonDetailKind;
  annual: AnnualHonours;
  activeClub: string;
  activeCountry: string;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const matchingLeagueGroups = (annual.standingGroups ?? []).filter((group) => group.clubs.includes(activeClub));
  const leagueGroups = matchingLeagueGroups.length ? matchingLeagueGroups : (annual.standingGroups ?? []);
  const domesticBrackets = (annual.playoffBrackets ?? []).filter((bracket) => bracket.ties.some((tie) => tie.home === activeClub || tie.away === activeClub));
  const europeanCompetitions = (annual.continentalRoll ?? []).filter((competition) => enteredEuropeanCompetition(competition, activeClub, activeCountry));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal((
    <div className="season-detail-backdrop">
      <section className="season-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="season-detail-title">
        <header><div><span>{annual.season} · {activeClub}</span><h3 id="season-detail-title">{kind === "league" ? "League season" : "European campaign"}</h3></div><button type="button" ref={closeButtonRef} onClick={onClose} aria-label="Close season details">×</button></header>
        <div className="season-detail-body">
          {kind === "league" && (
            <>
              {leagueGroups.length ? <div className="standing-groups">{leagueGroups.map((group) => <StandingTable group={group} annual={annual} activeClub={activeClub} activeCountry={activeCountry} key={group.name} />)}</div> : <p className="season-detail-empty">No league table was recorded for this season.</p>}
              {!!leagueGroups.length && <StandingLegend />}
              {!!domesticBrackets.length && <div className="season-dialog-brackets"><h4>Your playoff route</h4><div className="playoff-brackets">{domesticBrackets.map((bracket) => <PlayoffBracketView bracket={bracket} activeClub={activeClub} key={`${bracket.competition}-${bracket.name}`} />)}</div></div>}
            </>
          )}
          {kind === "europe" && (
            europeanCompetitions.length ? <div className="season-dialog-competitions">{europeanCompetitions.map((competition) => {
              const qualifyingBrackets = competition.qualifyingBrackets
                .map((bracket) => ({ ...bracket, ties: bracket.ties.filter((tie) => tie.home === activeClub || tie.away === activeClub) }))
                .filter((bracket) => bracket.ties.length);
              const reachedLeaguePhase = competition.table.some((club) => club.club === activeClub && club.country === activeCountry);
              const reachedKnockouts = competition.bracket.ties.some((tie) => tie.home === activeClub || tie.away === activeClub);
              return (
                <section className="season-dialog-competition" key={competition.key}>
                  <div className="season-dialog-competition-heading"><div><small>{competition.name}</small><h4>{competition.shortName}</h4></div><span>Champion · {competition.champion.club}</span></div>
                  {!!qualifyingBrackets.length && <div className="season-dialog-brackets"><h4>Your qualifying route</h4><div className="playoff-brackets">{qualifyingBrackets.map((bracket) => <PlayoffBracketView bracket={bracket} activeClub={activeClub} key={`${competition.key}-${bracket.name}`} />)}</div></div>}
                  {reachedLeaguePhase && <div className="season-dialog-table"><div className="continental-table-heading"><h5>League phase</h5><small>Your club is highlighted</small></div><ContinentalTable competition={competition} activeClub={activeClub} activeCountry={activeCountry} /></div>}
                  {reachedKnockouts && <div className="season-dialog-brackets"><h4>Knockout bracket</h4><PlayoffBracketView bracket={competition.bracket} activeClub={activeClub} /></div>}
                </section>
              );
            })}</div> : <p className="season-detail-empty">{activeClub} did not play in Europe this season.</p>
          )}
        </div>
      </section>
    </div>
  ), document.body);
}

function SeasonAtAGlance({ annual, activeClub, activeCountry, onOpen }: {
  annual: AnnualHonours;
  activeClub: string;
  activeCountry: string;
  onOpen: (kind: SeasonDetailKind, annual: AnnualHonours) => void;
}) {
  const league = leagueSeasonFocus(annual, activeClub);
  const europeanCampaigns = europeanSeasonFocus(annual, activeClub, activeCountry);

  return (
    <article className="season-focus-year">
      <h4>{annual.season} · {annual.league}</h4>
      <div className="season-focus-grid">
        <button type="button" className="season-focus-card season-focus-button league-focus" onClick={() => onOpen("league", annual)} aria-label={`Open ${annual.league} table for ${annual.season}`}>
          <small>League position</small>
          <strong>{league.result}</strong>
          <span>{league.detail}</span>
          <em>View table →</em>
        </button>
        <button type="button" className="season-focus-card season-focus-button european-focus" onClick={() => onOpen("europe", annual)} aria-label={`Open European campaign for ${annual.season}`}>
          <small>European performance</small>
          {europeanCampaigns.length ? europeanCampaigns.map((campaign) => (
            <span className="european-focus-line" key={`${campaign.competition}-${campaign.result}`}>
              <strong>{campaign.result}</strong>
              <span>{campaign.competition} · {campaign.detail}</span>
            </span>
          )) : <><strong>No campaign</strong><span>{activeClub} did not play in Europe</span></>}
          <em>{europeanCampaigns.length ? "View campaign →" : "View details →"}</em>
        </button>
        <div className={annual.playerHonours.length ? "season-focus-card honours-focus won" : "season-focus-card honours-focus"}>
          <small>Your honours</small>
          {annual.playerHonours.length ? (
            <div className="season-focus-honours">{annual.playerHonours.map((honour) => <span key={honour.id}>{honour.icon} {honour.name}</span>)}</div>
          ) : <><strong>None this season</strong><span>The cabinet remains available for future appointments.</span></>}
        </div>
      </div>
    </article>
  );
}

export function CareerScreen({
  game, player, scenario, achievements, canRequestTransfer, canReviewAgent, agentOptions, onSeasonSpanChange, onRevealOrigin,
  onOffer, onRequestTransfer, onAgentReview, onAgentChoice, onContinueSeason, onScenario, onContinueScenario,
}: CareerScreenProps) {
  const [seasonDetail, setSeasonDetail] = useState<{ kind: SeasonDetailKind; annual: AnnualHonours } | null>(null);
  const playerCountry = country(player.nation);
  const decisionDockRef = useRef<HTMLDivElement>(null);
  const decisionScrollKey = game.phase === "decision"
    ? `decision:${game.decisionKind}:${game.decisionTitle}`
    : game.phase === "scenario" && scenario
      ? `scenario:${scenario.id}`
      : game.phase === "origin-reveal"
        ? "origin-reveal"
        : null;

  useEffect(() => {
    if (!decisionScrollKey) return;
    const frame = window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      decisionDockRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [decisionScrollKey]);

  return (
    <section className="career-page page-enter">
      <div className="career-head">
        <div className="identity-block">
          <div className="mini-shirt">{player.number}</div>
          <div>
            <span className="eyebrow">{playerCountry.flag} {playerCountry.name} · #{player.number} {player.position}</span>
            <h2>{player.name}</h2><p>{player.currentClub} · Age {player.age}</p>
          </div>
        </div>
        <div className="rating-block"><strong>{player.rating}</strong><span>OVR</span></div>
      </div>
      <div className="career-stats">
        <div><small>Market value</small><strong>{formatMoney(player.value)}</strong></div>
        <div><small>Appearances</small><strong>{player.totalApps}</strong></div>
        <div><small>Goals</small><strong>{player.totalGoals}</strong></div>
        <div><small>Assists</small><strong>{player.totalAssists}</strong></div>
        <div><small>Trophies</small><strong>{player.trophies}</strong></div>
        <div><small>National caps</small><strong>{player.caps}</strong></div>
      </div>
      <div className="career-vitals">
        <span><i style={{ width: `${player.fitness}%` }} /><small>Fitness</small><strong>{player.fitness}</strong></span>
        <span><i style={{ width: `${player.morale}%` }} /><small>Morale</small><strong>{player.morale}</strong></span>
        <span><i style={{ width: `${player.reputation}%` }} /><small>Reputation</small><strong>{player.reputation}</strong></span>
        <span className="contract-pill"><small>Contract</small><strong>{player.currentClub === "Free agent" ? "None" : player.contractYears ? `${player.contractYears}Y left` : "Expired"}</strong></span>
        <span className="agent-pill" title={agentProfile(player.agent).description} aria-label={`Representation: ${player.agent}. ${agentProfile(player.agent).description}`}><small>Representation</small><strong>{player.agent}</strong></span>
      </div>

      <div className="decision-dock" ref={decisionDockRef} aria-live="polite">
        {game.phase === "origin-reveal" && (
          <div className={`origin-reveal ${player.origin}`}>
            <span className="story-kicker">Starting route · {player.origin === "gem" ? "7% rare" : player.origin === "senior" ? "16% chance" : "Most common"}</span>
            <h3>{game.decisionTitle}</h3><p>{game.decisionDescription}</p>
            <div className="origin-facts">
              <span><small>STARTING AGE</small><strong>{player.age}</strong></span>
              <span><small>STARTING OVR</small><strong>{player.rating}</strong></span>
              <span><small>FIRST LEVEL</small><strong>{player.origin === "academy" ? "Academy" : "Senior team"}</strong></span>
            </div>
            <button className="primary-button story-continue" onClick={onRevealOrigin}>See who wants you <span>→</span></button>
          </div>
        )}

        {game.phase === "decision" && game.decisionKind === "agent-review" && (
          <div className="agent-decision">
            <div className="dock-heading">
              <div><span className="story-kicker">Representation · before the transfer window</span><h3>{game.decisionTitle}</h3><p>{game.decisionDescription}</p></div>
            </div>
            <div className="agent-decision-current"><small>CURRENT REPRESENTATION</small><strong>{player.agent}</strong><span>{agentProfile(player.agent).description}</span></div>
            <div className="agent-options" aria-label="Available agents">
              {agentOptions.map((profile) => {
                const current = profile.name === player.agent;
                return (
                  <button type="button" className={current ? "active" : ""} onClick={() => onAgentChoice(profile.name)} key={profile.name}>
                    <span><strong>{profile.name}</strong><small>{profile.market === "global" ? "Global network" : profile.market === "development" ? "Development markets" : profile.market === "veteran" ? "Veteran markets" : "Domestic network"}</small></span>
                    <p className="agent-availability">Why now · {profile.availabilityReason}</p>
                    <p className="agent-description">{profile.description}</p>
                    <em>{current ? "Keep current agent →" : "Choose agent →"}</em>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {game.phase === "decision" && game.decisionKind !== "agent-review" && (
          <div className="club-decision">
            <div className="dock-heading">
              <div><span className="story-kicker">{game.decisionKind.replaceAll("-", " ")} · {game.decisionKind === "transfer-request" ? "player decision" : "club decision"}</span><h3>{game.decisionTitle}</h3><p>{game.decisionDescription}</p></div>
              <div className="season-control"><span>Simulate</span>{[1, 2, 3].map((years) => <button key={years} className={game.seasonSpan === years ? "active" : ""} onClick={() => onSeasonSpanChange(years)}>{years}Y</button>)}</div>
            </div>
            <div className="club-options">{game.offers.map((offer, index) => (
              <button key={`${offer.name}-${offer.kind}-${index}`} onClick={() => onOffer(offer)}>
                <span className="option-number">0{index + 1}</span><ClubBadge club={offer} />
                <div className="club-option-copy"><small>{offer.label}</small><strong>{offer.name}</strong><span>{offer.league} · {country(offer.country).flag} {offer.role}</span><p>{offer.reason}</p></div><em>Choose →</em>
              </button>
            ))}</div>
            <div className="player-career-actions">
              {canRequestTransfer && game.decisionKind === "continue" && (
                <div className="player-transfer-action">
                  <div><small>PLAYER POWER</small><strong>Want a new challenge away from {player.currentClub}?</strong><p>You can ask to leave even while under contract. Your level, the club&apos;s finances, its league and your agent determine whether credible bids arrive.</p></div>
                  <button onClick={onRequestTransfer}>Request a transfer <span>→</span></button>
                </div>
              )}
              {canReviewAgent && ["continue", "transfer-interest"].includes(game.decisionKind) && (
                <div className="agent-request-action">
                  <div><small>NOT CONVINCED?</small><strong>{game.decisionKind === "transfer-interest" ? "None of these approaches feel right?" : "Want somebody else to test the market?"}</strong><p>Pause this window and reconsider your representation. Your chosen agent will generate a fresh market before you decide where to play.</p></div>
                  <button type="button" onClick={onAgentReview}>Ask for new representation <span>→</span></button>
                </div>
              )}
            </div>
          </div>
        )}

        {game.phase === "season-result" && game.lastSeason && (
          <div className="season-stage">
            <div className="story-kicker">Season complete · Age {game.lastSeason.fromAge}–{game.lastSeason.toAge}</div>
            <div className="season-club">
              <ClubBadge club={clubByName(game.lastSeason.club)} />
              <div><span>{game.lastSeason.kind === "loan" ? "Loan chapter" : game.lastSeason.kind === "stay" ? "Another chapter at" : "Chapter at"}</span><h3>{game.lastSeason.club}</h3><p>{game.lastSeason.league}</p></div>
            </div>
            <blockquote>{game.lastSeason.event}</blockquote>
            {(game.lastSeason.breakout || game.lastSeason.injury) && (
              <div className="season-alerts">
                {game.lastSeason.breakout && <span className="breakout-alert">🚀 <b>Breakout season</b> · +{game.lastSeason.after - game.lastSeason.before} OVR</span>}
                {game.lastSeason.injury && <span className={`injury-alert ${game.lastSeason.injury}`}>🏥 <b>{game.lastSeason.injury} injury</b> · fitness and development affected</span>}
              </div>
            )}
            <div className="season-numbers">
              <span><strong>{game.lastSeason.apps}</strong><small>Apps</small></span>
              <span><strong>{game.lastSeason.goals}</strong><small>Goals</small></span>
              <span><strong>{game.lastSeason.assists}</strong><small>Assists</small></span>
              <span><strong>{game.lastSeason.trophies}</strong><small>Trophies</small></span>
              <span className={game.lastSeason.after >= game.lastSeason.before ? "up" : "down"}><strong>{game.lastSeason.before} → {game.lastSeason.after}</strong><small>OVR</small></span>
            </div>
            {!!game.lastSeason.honours?.length && (
              <section className="season-focus">
                <div className="season-focus-heading"><span>Your season at a glance</span><small>The results that affect your career.</small></div>
                {game.lastSeason.honours.map((annual) => <SeasonAtAGlance annual={annual} activeClub={game.lastSeason!.club} activeCountry={game.lastSeason!.country} onOpen={(kind, selectedAnnual) => setSeasonDetail({ kind, annual: selectedAnnual })} key={annual.season} />)}
              </section>
            )}
            <button className="primary-button story-continue" onClick={onContinueSeason}>Continue career <span>→</span></button>
            {!!game.lastSeason.honours?.length && (
              <details className="season-report">
                <summary><span>Full season report</span><small>All winners, tables, brackets and world movements</small></summary>
                <div className="honours-board">
                <div className="honours-board-heading"><span>Season honours board</span><small>Every simulated year receives a complete roll of honour.</small></div>
                {game.lastSeason.honours.map((annual) => (
                  <div className="annual-honours" key={annual.season}>
                    <h4>{annual.season} · {annual.league}</h4>
                    <div className="honour-results">
                      {(annual.titles ?? [{ name: "Champion", winner: annual.champion }]).map((title) => (
                        <div className={title.winner === game.lastSeason?.club ? "honour-result won" : "honour-result"} key={`${title.name}-${title.winner}`}><small>{title.name === "Champion" ? "League winner" : title.name}</small><strong>{title.winner}</strong><span>{annual.league}</span></div>
                      ))}
                      <div className={annual.cup.winner === game.lastSeason?.club ? "honour-result won" : "honour-result"}><small>{annual.cup.name}</small><strong>{annual.cup.winner}</strong><span>Cup winner</span></div>
                      {annual.additionalCups?.map((cup) => (
                        <div className={cup.winner === game.lastSeason?.club ? "honour-result won" : "honour-result"} key={`${cup.country}-${cup.name}`}><small>{cup.name}</small><strong>{cup.winner}</strong><span>Cup winner</span></div>
                      ))}
                      <div className={annual.topScorer.isPlayer ? "honour-result won" : "honour-result"}><small>Golden Boot</small><strong>{annual.topScorer.name}</strong><span>{annual.topScorer.club}{annual.topScorer.detail ? ` · ${annual.topScorer.detail}` : ""}</span></div>
                      <div className={annual.playerOfSeason.isPlayer ? "honour-result won" : "honour-result"}><small>Player of the Season</small><strong>{annual.playerOfSeason.name}</strong><span>{annual.playerOfSeason.club}</span></div>
                      <div className={annual.ballonDor.isPlayer ? "honour-result won" : "honour-result"}><small>Ballon d&apos;Or</small><strong>{annual.ballonDor.name}</strong><span>{annual.ballonDor.club}{annual.ballonDor.detail ? ` · ${annual.ballonDor.detail}` : ""}</span></div>
                      {annual.continentalRoll?.map((competition) => (
                        <div className={competition.champion.club === game.lastSeason?.club && competition.champion.country === game.lastSeason?.country ? "honour-result continental-won won" : "honour-result continental-won"} key={competition.key}>
                          <small>{competition.shortName}</small><strong>{competition.champion.club}</strong><span>{country(competition.champion.country).flag} European winner</span>
                        </div>
                      ))}
                    </div>
                    {!!annual.playerHonours.length && <div className="player-honours-earned">You won: {annual.playerHonours.map((honour) => `${honour.icon} ${honour.name}`).join(" · ")}</div>}
                    {!!annual.continentalRoll?.length && (
                      <details className="world-honours-roll continental-roll">
                        <summary>European football · {annual.continentalRoll.length} league phases &amp; knockout tournaments</summary>
                        <div className="continental-competitions">
                          {annual.continentalRoll.map((competition) => {
                            const entered = competition.entrants.some((club) => club.club === game.lastSeason?.club && club.country === game.lastSeason?.country)
                              || competition.qualifyingBrackets.some((bracket) => bracket.ties.some((tie) => tie.home === game.lastSeason?.club || tie.away === game.lastSeason?.club));
                            return (
                              <details className="continental-competition" key={competition.key} open={entered}>
                                <summary><span><b>{competition.shortName}</b><small>{competition.leagueMatches}-match league phase · 36 clubs</small></span><span><small>Champion</small><strong>{country(competition.champion.country).flag} {competition.champion.club}</strong></span></summary>
                                <div className="continental-competition-body">
                                  <details className="qualifying-rounds" open={entered && !competition.entrants.some((club) => club.club === game.lastSeason?.club && club.country === game.lastSeason?.country)}>
                                    <summary>Qualifying · {competition.qualifyingBrackets.reduce((total, bracket) => total + bracket.ties.length, 0)} ties</summary>
                                    <div className="playoff-brackets">{competition.qualifyingBrackets.map((bracket) => <PlayoffBracketView bracket={bracket} activeClub={game.lastSeason!.club} key={`${competition.key}-${bracket.name}`} />)}</div>
                                  </details>
                                  <div className="continental-table-heading"><h5>League phase</h5><small>1–8 Round of 16 · 9–24 Play-off · 25–36 Eliminated</small></div>
                                  <ContinentalTable competition={competition} activeClub={game.lastSeason!.club} activeCountry={game.lastSeason!.country} />
                                  <PlayoffBracketView bracket={competition.bracket} activeClub={game.lastSeason!.club} />
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </details>
                    )}
                    {!!annual.standingGroups?.length && <details className="world-honours-roll competition-roll"><summary>{annual.standingGroups.length === 1 ? `League table · ${annual.standingGroups[0].clubs.length} clubs` : `League tables · ${annual.standingGroups.length} groups`}</summary><div className="standing-groups">{annual.standingGroups.map((group) => <StandingTable group={group} annual={annual} activeClub={game.lastSeason!.club} activeCountry={game.lastSeason!.country} key={group.name} />)}</div><StandingLegend /></details>}
                    {!!annual.playoffBrackets?.length && <details className="world-honours-roll competition-roll"><summary>Playoff brackets · {annual.playoffBrackets.length}</summary><div className="playoff-brackets">{annual.playoffBrackets.map((bracket) => <PlayoffBracketView bracket={bracket} activeClub={game.lastSeason!.club} key={`${bracket.competition}-${bracket.name}`} />)}</div></details>}
                    {!!annual.movements?.length && <details className="world-honours-roll"><summary>Promotion &amp; relegation · {annual.movements.length / 2} swaps</summary><div className="world-honours-columns"><div><h5>Promoted</h5>{annual.movements.filter((movement) => movement.direction === "promoted").map((movement) => <div className="world-honour-row" key={`up-${movement.country}-${movement.club}`}><span>↑</span><div><strong>{movement.club}</strong><small>{movement.fromLeague} → {movement.toLeague} · {movement.route}</small></div></div>)}</div><div><h5>Relegated</h5>{annual.movements.filter((movement) => movement.direction === "relegated").map((movement) => <div className="world-honour-row" key={`down-${movement.country}-${movement.club}`}><span>↓</span><div><strong>{movement.club}</strong><small>{movement.fromLeague} → {movement.toLeague} · {movement.route}</small></div></div>)}</div></div></details>}
                    <details className="world-honours-roll">
                      <summary>Full world roll · {annual.divisionRoll?.length ?? 1} divisions · {annual.cupRoll?.length ?? 1} national cups</summary>
                      <div className="world-honours-columns">
                        <div><h5>Division honours</h5>{(annual.divisionRoll ?? [{ country: game.lastSeason!.country, league: annual.league, champion: annual.champion, topScorer: annual.topScorer, playerOfSeason: annual.playerOfSeason }]).map((division) => (
                          <div className="world-honour-row" key={`${division.country}-${division.league}`}>
                            <span>{country(division.country).flag}</span><div><strong>{division.league}</strong><small>{(division.titleWinners ?? [{ name: "Champion", winner: division.champion }]).map((title) => title.name === "Champion" ? title.winner : `${title.name}: ${title.winner}`).join(" · ")} · {division.topScorer.name} Golden Boot · {division.playerOfSeason.name} POTS</small></div>
                          </div>
                        ))}</div>
                        <div><h5>National cups</h5>{(annual.cupRoll ?? [{ country: game.lastSeason!.country, ...annual.cup }]).map((cup) => (
                          <div className="world-honour-row" key={`${cup.country}-${cup.name}`}>
                            <span>{country(cup.country).flag}</span><div><strong>{cup.name}</strong><small>{cup.winner}</small></div>
                          </div>
                        ))}</div>
                      </div>
                    </details>
                  </div>
                ))}
                </div>
              </details>
            )}
          </div>
        )}

        {game.phase === "scenario" && scenario && (
          <div className="scenario-stage">
            <div className="scenario-icon">{scenario.icon}</div><span className="story-kicker">{scenario.category} · career decision</span><h3>{scenario.title}</h3><p className="scenario-description">{scenario.description}</p>
            <div className="scenario-options">{scenario.options.map((option, index) => (
              <button key={`${option.label}-${index}`} onClick={() => onScenario(option)}><span className="option-number">0{index + 1}</span><div className="option-copy"><strong>{option.label}</strong><small>{option.hint}</small></div><div className="odds">{option.outcomes.map((item) => <span className={item.positive ? "positive" : "negative"} key={item.label}><b>{Math.round(item.probability * 100)}%</b>{item.label}</span>)}</div><em>Choose →</em></button>
            ))}</div>
          </div>
        )}

        {game.phase === "scenario-result" && game.outcome && (
          <div className={game.outcome.positive ? "outcome-stage positive" : "outcome-stage negative"}>
            <div className="fate-coin">{game.outcome.positive ? "✓" : "×"}</div><span className="story-kicker">Fate has decided</span><h3>{game.outcome.label}</h3><p>Your rating, fitness, reputation, representation and career trajectory now reflect that decision.</p><button className="primary-button story-continue" onClick={onContinueScenario}>Continue career <span>→</span></button>
          </div>
        )}
      </div>

      <div className="career-lower">
        <div className="timeline-panel">
          <div className="panel-heading"><h3>Career path</h3><span>{player.history.length} chapters</span></div>
          {player.history.length === 0 ? <p className="empty-state">Your first contract will start the timeline.</p> : (
            <div className="timeline">{player.history.map((season, index) => (
              <div className="timeline-row" key={`${season.club}-${season.fromAge}-${index}`}>
                <span className="timeline-age">{season.fromAge}–{season.toAge}</span><ClubBadge club={clubByName(season.club)} small />
                <div><strong>{season.kind === "loan" ? "↳ " : ""}{season.club}</strong><small>{season.role} · {season.apps} apps · {season.goals} G · {season.assists} A{season.trophies ? ` · ${season.trophies} trophies` : ""}</small></div>
                <span className={season.after >= season.before ? "rating-rise" : "rating-fall"}>{season.before} → {season.after}</span>
              </div>
            ))}</div>
          )}
        </div>
        <aside className="achievements-panel">
          <div className="panel-heading"><h3>Legacy</h3><span>{achievements.length}/9</span></div>
          <div className="achievement-list">{achievements.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong></div>)}</div>
        </aside>
      </div>
      {seasonDetail && <SeasonDetailDialog kind={seasonDetail.kind} annual={seasonDetail.annual} activeClub={game.lastSeason?.club ?? player.currentClub} activeCountry={game.lastSeason?.country ?? clubByName(player.currentClub)?.country ?? player.nation} onClose={() => setSeasonDetail(null)} />}
    </section>
  );
}
