import { makeAutoObservable, reaction, runInAction } from "mobx";
import { SCENARIOS } from "./catalog";
import {
  DEFAULT_SAVE,
  type CareerBeat,
  type CareerDraft,
  type Motion,
  type Offer,
  type SavedGame,
  type ScenarioOption,
  type Screen,
  type TrophyRoom,
} from "./domain";
import { careerEngine } from "./engine";
import { clearCareer, loadCareer, loadTrophyRoom, newCareerId, saveCareer, saveTrophyRoom } from "./storage";
import { EMPTY_TROPHY_ROOM, mergeCareerSnapshot, trophyRoomTotals } from "./trophyRoom";
import { createWorldState } from "./world";

const DEFAULT_DRAFT: CareerDraft = { name: "Kai Nash", nation: "ENG", position: "ST", number: 9 };

export class CareerStore {
  game: SavedGame = DEFAULT_SAVE;
  draft: CareerDraft = DEFAULT_DRAFT;
  motion: Motion | null = null;
  trophyRoom: TrophyRoom = EMPTY_TROPHY_ROOM;

  private hydrated = false;
  private motionTimer: number | null = null;

  constructor() {
    makeAutoObservable(this, {
      hydrated: false,
      motionTimer: false,
    }, { autoBind: true });
  }

  get player() {
    return this.game.player;
  }

  get scenario() {
    return this.game.scenarioId
      ? SCENARIOS.find((item) => item.id === this.game.scenarioId) ?? null
      : null;
  }

  get achievements() {
    return this.player ? careerEngine.achievements(this.player) : [];
  }

  get trophyTotals() {
    return trophyRoomTotals(this.trophyRoom);
  }

  startPersistence() {
    if (!this.hydrated) {
      const saved = loadCareer();
      let archive = loadTrophyRoom();
      if (saved) {
        if (saved.player && saved.careerId) {
          archive = mergeCareerSnapshot(archive, saved.careerId, saved.player);
        }
        this.game = saved;
      }
      this.trophyRoom = archive;
      this.hydrated = true;
    }

    const stopCareerPersistence = reaction(
      () => this.game,
      (game) => saveCareer(game),
    );
    const stopTrophyPersistence = reaction(
      () => this.trophyRoom,
      (room) => saveTrophyRoom(room),
    );

    return () => {
      stopCareerPersistence();
      stopTrophyPersistence();
      if (this.motionTimer !== null) window.clearTimeout(this.motionTimer);
    };
  }

  setDraft(draft: CareerDraft) {
    this.draft = draft;
  }

  setSeasonSpan(seasonSpan: number) {
    this.updateGame({ seasonSpan });
  }

  navigate(screen: Screen) {
    this.updateGame({ screen });
  }

  resumeCareer() {
    if (this.player) this.navigate(this.player.age >= 36 ? "summary" : "career");
  }

  revealOrigin() {
    this.updateGame({ phase: "decision" });
  }

  startCareer() {
    const start = careerEngine.createCareer(this.draft);
    const careerId = newCareerId();
    const world = createWorldState();
    this.showMotion({
      kind: "origin",
      title: "Drawing your starting route",
      detail: "Academy prospect, early professional… or something rarer.",
    }, () => {
      this.updateGame({
        careerId,
        screen: "career",
        phase: "origin-reveal",
        player: start.player,
        offers: start.offers,
        lastSeason: null,
        scenarioId: null,
        outcome: null,
        decisionKind: "first-club",
        decisionTitle: start.title,
        decisionDescription: start.description,
        world,
      });
      this.trophyRoom = mergeCareerSnapshot(this.trophyRoom, careerId, start.player);
    }, 1050);
  }

  chooseOffer(offer: Offer) {
    if (!this.player) return;
    const careerId = this.game.careerId ?? newCareerId();
    const result = careerEngine.simulateSeason(this.player, offer, this.game.seasonSpan, this.game.world);
    const years = result.season.toAge - result.season.fromAge;
    this.showMotion({
      kind: "season",
      title: years === 1 ? "The season is playing out" : `${years} seasons are playing out`,
      detail: `${offer.name} · ${offer.role} · form, minutes and fitness are moving.`,
    }, () => {
      this.updateGame({
        careerId,
        screen: "career",
        phase: "season-result",
        player: result.player,
        offers: [],
        lastSeason: result.season,
        scenarioId: null,
        outcome: null,
        world: result.world,
      });
      this.trophyRoom = mergeCareerSnapshot(this.trophyRoom, careerId, result.player);
    }, 1200);
  }

  continueAfterSeason() {
    if (this.player) {
      this.applyBeat(careerEngine.nextBeat(this.player, this.game.lastSeason, this.game.world));
    }
  }

  resolveScenario(option: ScenarioOption) {
    if (!this.player || !this.scenario) return;
    const careerId = this.game.careerId ?? newCareerId();
    const result = careerEngine.resolveScenario(this.player, this.scenario, option);
    this.showMotion({
      kind: "fate",
      title: "The outcome is being decided",
      detail: option.outcomes
        .map((item) => `${Math.round(item.probability * 100)}% ${item.positive ? "good" : "bad"}`)
        .join(" · "),
    }, () => {
      this.updateGame({
        careerId,
        phase: "scenario-result",
        player: result.player,
        outcome: result.outcome,
      });
      this.trophyRoom = mergeCareerSnapshot(this.trophyRoom, careerId, result.player);
    }, 1150);
  }

  continueAfterScenario() {
    if (this.player) {
      this.applyBeat(careerEngine.ordinaryDecision(this.player, this.game.world));
    }
  }

  resetGame() {
    clearCareer();
    this.game = DEFAULT_SAVE;
    this.draft = DEFAULT_DRAFT;
  }

  private updateGame(patch: Partial<SavedGame>) {
    this.game = { ...this.game, ...patch };
  }

  private applyBeat(beat: CareerBeat) {
    if (beat.type === "summary") {
      this.updateGame({ screen: "summary" });
      return;
    }
    if (beat.type === "scenario") {
      this.updateGame({ phase: "scenario", scenarioId: beat.scenario.id, outcome: null });
      return;
    }
    this.updateGame({
      phase: "decision",
      offers: beat.offers,
      scenarioId: null,
      outcome: null,
      decisionKind: beat.kind,
      decisionTitle: beat.title,
      decisionDescription: beat.description,
    });
  }

  private showMotion(nextMotion: Motion, action: () => void, delay = 950) {
    if (this.motionTimer !== null) window.clearTimeout(this.motionTimer);
    this.motion = nextMotion;
    this.motionTimer = window.setTimeout(() => {
      runInAction(() => {
        action();
        this.motion = null;
        this.motionTimer = null;
      });
    }, delay);
  }
}
