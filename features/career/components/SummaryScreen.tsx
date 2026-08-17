"use client";

import { useEffect, useMemo, useState } from "react";
import { clubByName, country } from "../catalog";
import { careerSummary, createCareerShareImage, downloadCareerShareImage, shareCareerImage } from "../careerShare";
import type { Player } from "../domain";
import { ClubBadge } from "./ClubBadge";

type SummaryScreenProps = {
  player: Player;
  onReset: () => void;
  onTrophyRoom: () => void;
};

export function SummaryScreen({ player, onReset, onTrophyRoom }: SummaryScreenProps) {
  const summary = useMemo(() => careerSummary(player), [player]);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [nativeShare, setNativeShare] = useState(false);
  const [shareStatus, setShareStatus] = useState("Creating your career image…");
  const [shareBusy, setShareBusy] = useState(true);

  useEffect(() => {
    let active = true;
    let imageUrl: string | null = null;

    createCareerShareImage(player).then((blob) => {
      if (!active) return;
      imageUrl = URL.createObjectURL(blob);
      setShareBlob(blob);
      setShareUrl(imageUrl);
      setNativeShare(Boolean(navigator.share && navigator.canShare?.({
        files: [new File([blob], "goalbound-career.png", { type: "image/png" })],
      })));
      setShareStatus("Your share card is ready.");
      setShareBusy(false);
    }).catch(() => {
      if (!active) return;
      setShareStatus("The image could not be created in this browser. You can still view the full career below.");
      setShareBusy(false);
    });

    return () => {
      active = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [player]);

  const handleShare = async () => {
    if (!shareBlob) return;
    setShareBusy(true);
    try {
      const result = await shareCareerImage(shareBlob, player);
      setShareStatus(result === "shared" ? "Career card shared." : "Career card downloaded. Attach it anywhere you like.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") setShareStatus("Sharing cancelled.");
      else setShareStatus("Sharing did not work. You can still download the image.");
    } finally {
      setShareBusy(false);
    }
  };

  const handleDownload = () => {
    if (!shareBlob) return;
    downloadCareerShareImage(shareBlob, player);
    setShareStatus("Career card downloaded.");
  };

  const bestSeason = summary.bestSeason;
  const biggestRise = summary.biggestRise;
  const biggestRiseValue = biggestRise ? biggestRise.after - biggestRise.before : null;

  return (
    <section className="summary-page page-enter">
      <header className="summary-heading">
        <span className="eyebrow">Career complete · Retired at {player.age}</span>
        <h2>{player.name}<br /><em>leaves a legacy.</em></h2>
        <p className="summary-lead">
          From {summary.nation.name} to {summary.uniqueClubs} {summary.uniqueClubs === 1 ? "club" : "clubs"} across {summary.seasons} seasons.
          The boots are hung up. The group chat is, regrettably, permanent.
        </p>
      </header>

      <div className="summary-overview">
        <div className="summary-score">
          <span>PEAK OVR</span>
          <strong>{summary.peakRating}</strong>
          <small>{summary.label}</small>
          <b>Final OVR {player.rating}</b>
        </div>
        <div className="summary-passport">
          <span className="eyebrow">Career passport</span>
          <dl>
            <div><dt>Nation</dt><dd>{summary.nation.flag} {summary.nation.name}</dd></div>
            <div><dt>Position</dt><dd>{player.position}</dd></div>
            <div><dt>Professional debut</dt><dd>Age {summary.debutAge}</dd></div>
            <div><dt>Final club</dt><dd>{player.currentClub}</dd></div>
            <div><dt>Clubs</dt><dd>{summary.uniqueClubs}</dd></div>
            <div><dt>Countries played in</dt><dd>{summary.countriesPlayed}</dd></div>
          </dl>
        </div>
      </div>

      <div className="summary-stats" aria-label="Final career statistics">
        <div><strong>{player.totalApps}</strong><span>Apps</span></div>
        <div><strong>{player.totalGoals}</strong><span>Goals</span></div>
        <div><strong>{player.totalAssists}</strong><span>Assists</span></div>
        <div><strong>{player.trophies}</strong><span>Trophies</span></div>
        <div><strong>{player.caps}</strong><span>Caps</span></div>
        <div><strong>{player.nationalGoals}</strong><span>Intl goals</span></div>
      </div>

      <section className="summary-section summary-journey">
        <div className="summary-section-heading">
          <div><span className="eyebrow">The route</span><h3>Club journey</h3></div>
          <p>Each line is one continuous spell. Returning to a former club earns its own chapter.</p>
        </div>
        <div className="summary-spells">
          {summary.spells.map((spell, index) => (
            <article className="summary-spell" key={`${spell.club}-${spell.fromAge}-${index}`}>
              <span className="summary-spell-index">{String(index + 1).padStart(2, "0")}</span>
              <ClubBadge club={clubByName(spell.club)} small />
              <div className="summary-spell-club">
                <strong>{spell.club}</strong>
                <small>{country(spell.country).flag} {spell.league} · Ages {spell.fromAge}–{spell.toAge}</small>
              </div>
              <div className="summary-spell-record">
                <span><b>{spell.apps}</b> apps</span>
                <span><b>{spell.goals}</b> goals</span>
                <span><b>{spell.assists}</b> assists</span>
              </div>
              <div className="summary-spell-rating"><small>OVR</small><strong>{spell.ratingBefore} → {spell.ratingAfter}</strong></div>
            </article>
          ))}
        </div>
      </section>

      <div className="summary-story-grid">
        <section className="summary-section summary-honours">
          <div className="summary-section-heading">
            <div><span className="eyebrow">Silverware</span><h3>Honours won</h3></div>
            <button className="quiet-button" onClick={onTrophyRoom}>Full trophy room →</button>
          </div>
          {summary.honours.length > 0 ? (
            <div className="summary-honour-list">
              {summary.honours.map((honour) => (
                <article key={honour.id}>
                  <span>{honour.icon}</span>
                  <div><strong>{honour.name}</strong><small>{honour.season} · {honour.club}</small></div>
                  <b>{honour.category}</b>
                </article>
              ))}
              {player.trophies > summary.honours.filter((honour) => honour.category === "team").length && (
                <article>
                  <span>🏆</span>
                  <div><strong>Earlier team silverware</strong><small>Also recorded in this career</small></div>
                  <b>×{player.trophies - summary.honours.filter((honour) => honour.category === "team").length}</b>
                </article>
              )}
            </div>
          ) : (
            <div className="summary-empty-honours">
              <strong>{player.trophies > 0 ? `${player.trophies} trophies won` : "No medals, still a career"}</strong>
              <p>{player.trophies > 0 ? "Some older honours were recorded before the engraver learned to save names." : "The trophy cabinet is minimalist. The appearance record is not."}</p>
            </div>
          )}
        </section>

        <section className="summary-section summary-highlights">
          <div className="summary-section-heading"><div><span className="eyebrow">Career tape</span><h3>Defining numbers</h3></div></div>
          <div className="summary-highlight-list">
            <article><span>Best output</span><strong>{bestSeason ? `${bestSeason.goals}G + ${bestSeason.assists}A` : "—"}</strong><small>{bestSeason ? `${bestSeason.club}, ages ${bestSeason.fromAge}–${bestSeason.toAge}` : "No season recorded"}</small></article>
            <article><span>Biggest rise</span><strong>{biggestRiseValue === null ? "—" : `${biggestRiseValue >= 0 ? "+" : ""}${biggestRiseValue} OVR`}</strong><small>{biggestRise ? `${biggestRise.club} · ${biggestRise.before} → ${biggestRise.after}` : "No season recorded"}</small></article>
            <article><span>Breakout seasons</span><strong>{summary.breakouts}</strong><small>{summary.breakouts ? "Everything clicked" : "Growth arrived without a press release"}</small></article>
            <article><span>Serious injuries</span><strong>{summary.seriousInjuries}</strong><small>{summary.seriousInjuries ? "Comebacks are part of the record" : "The physio remained unusually relaxed"}</small></article>
          </div>
        </section>
      </div>

      <section className="summary-share">
        <div className="summary-share-copy">
          <span className="eyebrow">Share the career</span>
          <h3>Your career card</h3>
          <p>A high-resolution image that grows to fit every club spell and every honour. On supported phones, Share to apps opens the native share sheet.</p>
          <div className="summary-share-actions">
            <button className="primary-button" onClick={handleShare} disabled={!shareBlob || shareBusy}>
              {nativeShare ? "Share to apps" : "Download share image"}<span>↗</span>
            </button>
            <button className="secondary-button" onClick={handleDownload} disabled={!shareBlob || shareBusy}>Download PNG</button>
          </div>
          <small className="summary-share-status" role="status" aria-live="polite">{shareStatus}</small>
        </div>
        <div className="summary-share-preview">
          {shareUrl ? (
            // The preview is generated locally from the player's career and has no static URL.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shareUrl} alt={`Share card summarising ${player.name}'s career`} />
          ) : <div className="summary-share-loading"><i /><span>{shareBusy ? "Drawing career card…" : "Preview unavailable"}</span></div>}
        </div>
      </section>

      <div className="summary-actions summary-final-actions">
        <button className="primary-button" onClick={onReset}>Start another career <span>↻</span></button>
        <button className="secondary-button" onClick={onTrophyRoom}>Open trophy room</button>
      </div>
    </section>
  );
}
