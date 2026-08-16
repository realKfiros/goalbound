import type { CSSProperties } from "react";
import type { Club } from "../domain";

export function ClubBadge({ club, small = false }: { club: Club | undefined; small?: boolean }) {
  if (!club) return <span className={small ? "club-badge small" : "club-badge"}>FA</span>;
  return (
    <span className={small ? "club-badge small" : "club-badge"} style={{ "--club-color": club.colors } as CSSProperties}>
      <b>{club.short}</b>
    </span>
  );
}
