"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { knownClubBadge, resolveClubBadge } from "../clubBadges";
import type { Club } from "../domain";

type ClubBadgeProps = {
  club: Club | undefined;
  small?: boolean;
  fetchRemote?: boolean;
  locked?: boolean;
};

export function ClubBadge({ club, small = false, fetchRemote = true, locked = false }: ClubBadgeProps) {
  const clubKey = club ? `${club.country}:${club.name}` : "";
  const knownBadge = knownClubBadge(club);
  const [remoteResult, setRemoteResult] = useState<{ key: string; badge: string | null } | null>(null);
  const [failedBadge, setFailedBadge] = useState<string | null>(null);

  useEffect(() => {
    if (!club || locked || knownBadge || !fetchRemote) return;
    let active = true;
    resolveClubBadge(club).then((badge) => {
      if (active) setRemoteResult({ key: clubKey, badge });
    });
    return () => { active = false; };
  }, [club, clubKey, fetchRemote, knownBadge, locked]);

  const remoteBadge = remoteResult?.key === clubKey ? remoteResult.badge : null;
  const badge = knownBadge ?? remoteBadge;
  const hasImage = !!badge && failedBadge !== badge;
  const className = [small ? "club-badge small" : "club-badge", locked ? "locked" : "", hasImage ? "has-image" : ""]
    .filter(Boolean)
    .join(" ");

  if (!club) return <span className={className}>FA</span>;
  return (
    <span className={className} style={{ "--club-color": club.colors } as CSSProperties}>
      {hasImage
        // The source is selected at runtime, so an optimized build-time image component cannot enumerate it.
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={badge} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedBadge(badge)} />
        : <b>{locked ? "?" : club.short}</b>}
    </span>
  );
}
