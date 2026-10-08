"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { GameUI } from "./GameUI";
import { GraduationPhotos } from "./GraduationPhotos";
import { personalConversation } from "./conversations";
import { NamesPanel } from "./NamesPanel";
import { WorldMap } from "./WorldMap";
import { StoryPhone } from "./StoryPhone";
import { TimelineJournal } from "./TimelineJournal";
import { EncounterElias, PhoneArt, RadegastPasture } from "./StoryWorldArt";
import { readProgress } from "./memories/progress";
import { TIMELINE_KEY, STORY_END, STORY_EVENTS, advanceTimelineClock, beginEvent, clockAtLeast, completeEvent, emptyEvent, eventById, eventStatus, historicalDate, initialTimeline, jumpToNext, nextEvent, parseTimeline, sleepTimelineClock, type EventProgress, type StoryEvent, type StorySession, type TimelineSave } from "./timeline";
import { NAMES_KEY, displayName, initialNames, parseNames, renamePerson, type NameSave } from "./names";
import { WALK_ATLASES } from "./graphics07";
import { pressedKeys, useInput } from "./input";
import { useMemories } from "./memories/store";
import { MemoryTransition } from "./memories/MemoryTransition";
import { ShootingMemory } from "./memories/ShootingMemory";
import { ItemArt } from "./SceneArt";
import { BenchArt, CharacterArt, WorldAtmosphere, WorldBackdrop, characterStyle } from "./WorldArt";
import { advanceRest, beginRest, hasLeft, leaveRest, restPosition, type RestMotion } from "./rest";
import { movementStep, walkingFrame } from "./motion";
import { advanceActor, availableSeat, canChangePose, initialActors, requestPose, type Actor, type Actors, type Pose } from "./actors";
import { speakerGraphic } from "./graphics";
import { cameraFor, offscreenGuide } from "./camera";
import { audioAllowed, worldAudio } from "./audio";
import { ACTION_MINUTES, DAY_KEY, REST_SPOTS, SCHOOL_END, SCHOOL_START, SEASONS, TRAVEL_MINUTES, activityAt, clockText, parseDay, seasonalLight, type DaySave, type RestSpot, type Season } from "./day";
import { CHAPTERS, ENTITIES, PLACES, SPAWNS, STORY_KEY, EMPTY_STORY, advanceStory, beginChapter, canWalk, currentStep, parseStory, routeTo, type ChapterId, type Entity, type Place, type Point, type StorySave } from "./story";

type Direction = "front" | "left" | "back" | "right";
type Dialogue = { speaker: string; art?: string; text: string; target?: string; ending?: boolean; choices?: string[]; action?: "school" | "pose" | "kitchen" | "encounter" | "calendar"; actorId?: string; kitchenId?: string; morning?: boolean };
type Rest = { spot: RestSpot; elias: boolean; motion: RestMotion; companion?: RestMotion };
type Notice = { date: string; minute: number; label: string };
function clearMovement() { pressedKeys.clear(); useInput.getState().setMove(0, 0); }

export function Game() {
  const [started, setStarted] = useState(false);
  const [initial] = useState(() => {
    try { return { save: parseStory(window.localStorage.getItem(STORY_KEY)), error: null }; }
    catch { return { save: EMPTY_STORY, error: "Der gespeicherte Spielstand ist nicht lesbar. Er bleibt unangetastet; du kannst für diese Sitzung spielen." }; }
  });
  const [worldSave, setStory] = useState<StorySave>(initial.save);
  const [timelineInitial] = useState(() => {
    try {
      const raw = window.localStorage.getItem(TIMELINE_KEY);
      if (raw) return { save: parseTimeline(raw), error: null };
      let legacyDay: DaySave | undefined;
      try { const rawDay = window.localStorage.getItem(DAY_KEY); if (rawDay) legacyDay = parseDay(rawDay); } catch { /* Preserve unreadable legacy data. */ }
      let shootingCompleted = false;
      try { shootingCompleted = Boolean(readProgress(window.localStorage)["goelzau-shooting"]); } catch { /* The existing store reports its own error. */ }
      return { save: initialTimeline(legacyDay, initial.save, shootingCompleted), error: null };
    } catch { return { save: initialTimeline(undefined, initial.save), error: "Der Story-Kalender ist nicht lesbar und bleibt unangetastet. Du kannst für diese Sitzung spielen." }; }
  });
  const [timeline, setTimeline] = useState<TimelineSave>(timelineInitial.save);
  const timelineRef = useRef(timelineInitial.save);
  const timelineReadable = useRef(!timelineInitial.error);
  const [dayError, setDayError] = useState<string | null>(timelineInitial.error);
  const day = timeline.clock;
  const dayRef = useRef(day);
  const [replay, setReplay] = useState<{ session: StorySession; state: EventProgress } | null>(null);
  const replayRef = useRef(replay);
  const [legacyView, setLegacyView] = useState<{ save: StorySave; player: Point; direction: Direction } | null>(null);
  const session = replay?.session ?? timeline.active;
  const event = session ? eventById(session.id) : undefined;
  const eventState = replay?.state ?? (session ? timeline.progress[session.id] ?? emptyEvent() : null);
  const save: StorySave = event ? { ...worldSave, place: event.place, chapter: null, bag: event.scene === "encounter" && (eventState?.cursor ?? 0) >= 3 ? ["Schokolade"] : [] } : worldSave;
  const [phone, setPhone] = useState(false);
  const [storyToast, setStoryToast] = useState<StoryEvent | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  replayRef.current = replay;
  const arrival = useRef(0);
  const [arrivalTime, setArrivalTime] = useState(0);
  const [namesInitial] = useState(() => {
    try { return { save: parseNames(window.localStorage.getItem(NAMES_KEY)), error: null }; }
    catch { return { save: initialNames(), error: "Die gespeicherten Namen sind nicht lesbar und bleiben unangetastet. Neue Namen gelten für diese Sitzung." }; }
  });
  const [names, setNames] = useState<NameSave>(namesInitial.save);
  const namesRef = useRef(namesInitial.save);
  const namesReadable = useRef(!namesInitial.error);
  const [namesError, setNamesError] = useState<string | null>(namesInitial.error);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [rest, setRest] = useState<Rest | null>(null);
  const restRef = useRef<Rest | null>(null);
  const [visitingElias, setVisitingElias] = useState<Place | null>(null);
  const [actors, setActors] = useState<Actors>(initialActors);
  const actorsRef = useRef(actors);
  const [photoMoment, setPhotoMoment] = useState<{ target?: string } | null>(null);
  const [kitchenEffect, setKitchenEffect] = useState<string | null>(null);
  const [player, setPlayer] = useState<Point>(timelineInitial.save.active ? eventById(timelineInitial.save.active.id)!.staging.spawn : SPAWNS[initial.save.place]);
  const [direction, setDirection] = useState<Direction>("front");
  const [walking, setWalking] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const walkDistance = useRef(0);
  const [dog, setDog] = useState<Point>({ x: .58, y: .53 });
  const dogRef = useRef(dog);
  const [journal, setJournal] = useState(false);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [needsLandscape, setNeedsLandscape] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(initial.error);
  const readable = useRef(!initial.error);
  const playerRef = useRef(player);
  const dialogueRef = useRef<HTMLDialogElement>(null);
  const journalRef = useRef<HTMLDialogElement>(null);
  const paused = useInput(s => s.paused);
  const phase = useMemories(s => s.phase);
  const memoryProgress = useMemories(s => s.progress);
  const memoryError = useMemories(s => s.storageError);
  const transitioning = phase === "entering" || phase === "leaving";
  const inWorld = phase === "room";
  const active = started && !paused && !needsLandscape && inWorld && !journal && !dialogue && !phone && !photoMoment;
  const chapter = CHAPTERS.find(c => c.id === save.chapter);
  const step = currentStep(save);
  const draftPlaying = Boolean(legacyView || worldSave.chapter && currentStep(worldSave));
  const exits = event ? [] : PLACES[save.place].exits;
  const guide = step && step.place !== save.place ? routeTo(save.place, step.place) : undefined;
  const dogFollows = save.place === "garden" && save.completed.includes("dog") && save.chapter !== "dog";
  const sourceEntities = (event ? [] : [...ENTITIES[save.place], ...(visitingElias === save.place ? [ELIAS_GUEST] : [])]).map(entity => ({ ...entity, name: displayName(entity, names) }));
  const sceneEntities = sourceEntities.filter(e => !rest?.elias || e.art !== "elias").map(e => e.id === "anuk" && dogFollows ? { ...e, ...dog } : actors[e.id] ? { ...e, ...actors[e.id].position } : e);
  const nearbyExit = exits.filter(e => Math.hypot(e.x-player.x, e.y-player.y) < .105).sort((a,b) => Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];
  const nearbyEntity = sceneEntities.map(e => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y), companion: e.id === "anuk" && save.completed.includes("dog") && save.chapter !== "dog" })).filter(v => v.d < .115 && !(v.companion && nearbyExit) && (!nearbyExit || v.d < Math.hypot(nearbyExit.x-player.x, nearbyExit.y-player.y))).sort((a,b) => Number(a.companion)-Number(b.companion) || a.d-b.d)[0]?.e;
  const spots = REST_SPOTS.filter(spot => spot.place === save.place && (!event || event.scene !== "encounter"));
  const nearbySpot = spots.filter(spot => Math.hypot(spot.approach.x-player.x,spot.approach.y-player.y) < .115 && !Object.values(actors).some(actor => actor.restId?.startsWith(`${spot.id}:`))).sort((a,b) => Math.hypot(a.approach.x-player.x,a.approach.y-player.y)-Math.hypot(b.approach.x-player.x,b.approach.y-player.y))[0];
  const restTarget = nearbySpot && (!nearbyEntity || Math.hypot(nearbySpot.approach.x-player.x,nearbySpot.approach.y-player.y) < Math.hypot(nearbyEntity.x-player.x,nearbyEntity.y-player.y)) && (!nearbyExit || Math.hypot(nearbySpot.approach.x-player.x,nearbySpot.approach.y-player.y) < Math.hypot(nearbyExit.x-player.x,nearbyExit.y-player.y)) ? nearbySpot : undefined;
  const target = restTarget ?? nearbyEntity ?? nearbyExit;
  const targetName = restTarget?.name ?? nearbyEntity?.name ?? nearbyExit?.label;
  const sceneMinute = event ? event.scene === "chat" ? Math.min(1380, 1020 + (eventState?.topics.length ?? 0) * 120) : event.staging.start : save.chapter === "graduation" ? 840 : day.minute;
  const light = seasonalLight(event ? "Herbst" : save.chapter === "graduation" ? "Sommer" : day.season, sceneMinute);
  const winter = !event && save.chapter !== "graduation" && (day.season === "Winter" || save.chapter === "christmas");
  const upcoming = nextEvent(timeline);
  const datedCompleted = STORY_EVENTS.filter(e => e.confirmed && timeline.progress[e.id]?.completedAt).length;
  const arrived = eventState && eventState.cursor > 0 ? 1 : Math.min(1, arrivalTime / 3);
  const eliasPoint = { x: .78 - .18 * arrived, y: .91 - .27 * arrived };
  const encounterNearby = event?.scene === "encounter" && (eventState?.cursor ?? 0) >= 1 && Math.hypot(player.x - .6, player.y - .64) < .13;
  const restPose: Pose = rest?.motion.actor.pose ?? "standing";
  const bedOccupied = rest?.spot.kind === "bed" && rest.motion.phase === "resting";
  const settled = rest?.motion.phase === "resting";

  function changeRest(next: Rest | null) { restRef.current = next; setRest(next); }

  function updateActors(next: Actors) { actorsRef.current = next; setActors(next); }

  function position(point: Point) { playerRef.current = point; setPlayer(point); setWalking(false); clearMovement(); }
  const setSave = useCallback((next: StorySave) => {
    setStory(next);
    if (!readable.current) return;
    try { window.localStorage.setItem(STORY_KEY, JSON.stringify(next)); setSaveError(null); }
    catch { setSaveError("Speichern ist gerade nicht möglich. Dein Fortschritt bleibt für diese Sitzung erhalten."); }
  }, [setStory, setSaveError]);
  const persistTimeline = useCallback((next: TimelineSave) => {
    timelineRef.current = next; dayRef.current = next.clock; setTimeline(next);
    if (!timelineReadable.current) return;
    try { window.localStorage.setItem(TIMELINE_KEY, JSON.stringify(next)); setDayError(null); }
    catch { setDayError("Der Story-Fortschritt bleibt für diese Sitzung erhalten. Lokales Speichern ist gerade nicht möglich."); }
  }, []);
  const persistDay = useCallback((next: DaySave) => {
    if (sessionRef.current || draftPlaying) return;
    persistTimeline({ ...timelineRef.current, clock: next });
  }, [persistTimeline, draftPlaying]);
  const changeEventState = useCallback((next: EventProgress) => {
    if (replayRef.current) { const value = { ...replayRef.current, state: next }; replayRef.current = value; setReplay(value); return; }
    const current = timelineRef.current;
    if (current.active) persistTimeline({ ...current, progress: { ...current.progress, [current.active.id]: next } });
  }, [persistTimeline]);
  function persistNames(next: NameSave) {
    namesRef.current = next; setNames(next);
    if (!namesReadable.current) return;
    try { window.localStorage.setItem(NAMES_KEY, JSON.stringify(next)); setNamesError(null); }
    catch { setNamesError("Die Namen gelten für diese Sitzung. Sie konnten nicht auf diesem Gerät gespeichert werden."); }
  }
  function changeName(id: string, value: string) {
    try { persistNames(renamePerson(namesRef.current, id, value)); }
    catch { setNamesError("Bitte verwende einen Namen mit höchstens 32 Zeichen."); }
  }
  const spendTime = useCallback((minutes: number, place = save.place) => {
    if (sessionRef.current || legacyView || worldSave.chapter && currentStep(worldSave)) return;
    const result = advanceTimelineClock(dayRef.current, minutes);
    persistDay(result.save);
    setNotices(previous => [...previous, ...result.notices.map(notice => ({ ...notice, label: `${activityAt(place, notice.minute % 1440)} · ${PLACES[place].name}` }))]);
  }, [persistDay, save.place, legacyView, worldSave]);
  useEffect(() => { if (started) persistTimeline(timelineRef.current); }, [started, persistTimeline]);
  useEffect(() => {
    worldAudio.setMood(event?.scene === "love" && (eventState?.cursor ?? 0) >= 2 ? "love" : event && event.scene !== "encounter" ? "evening" : "world");
  }, [event?.scene, eventState?.cursor]);
  useEffect(() => {
    if (!notices.length || !active || document.hidden) return;
    const timer = window.setTimeout(() => setNotices(previous => previous.slice(1)), 4500);
    return () => window.clearTimeout(timer);
  }, [notices, active]);
  useEffect(() => {
    if (!kitchenEffect || !active) return;
    const timer = window.setTimeout(() => setKitchenEffect(null), 3000);
    return () => window.clearTimeout(timer);
  }, [kitchenEffect, active]);
  useEffect(() => { useMemories.getState().load(); }, []);
  useEffect(() => {
    try { worldAudio.load(window.localStorage); } catch { /* Storage may be disabled. */ }
    return () => worldAudio.stop();
  }, []);
  useEffect(() => {
    const sync = () => worldAudio.setScene(inWorld ? save.place : "range", audioAllowed({ started, paused, hidden: document.hidden, landscape: !needsLandscape, transitioning }));
    sync(); document.addEventListener("visibilitychange", sync);
    return () => { document.removeEventListener("visibilitychange", sync); worldAudio.stop(); };
  }, [started, paused, needsLandscape, transitioning, save.place, inWorld]);

  useEffect(() => {
    const query = window.matchMedia("(orientation: portrait) and (max-width: 760px)");
    const update = () => { setNeedsLandscape(query.matches); if (query.matches) clearMovement(); };
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = dialogue ? dialogueRef.current : journal ? journalRef.current : null;
    if (node && !node.open) node.showModal();
    return () => { if (node?.open) node.close(); };
  }, [dialogue, journal]);

  const move = useCallback((seconds: number) => {
    const next = { ...actorsRef.current };
    let changed = false;
    for (const entity of event ? [] : [...ENTITIES[save.place], ...(visitingElias === save.place ? [ELIAS_GUEST] : [])]) {
      const actor = next[entity.id];
      if (!actor || restRef.current?.elias && entity.art === "elias") continue;
      const updated = advanceActor(save.place, entity.id, actor, seconds);
      if (updated !== actor) { next[entity.id] = updated; changed = true; }
    }
    if (changed) { actorsRef.current = next; setActors(next); }
    if (event?.scene === "encounter" && eventState?.cursor === 0) {
      arrival.current += seconds; setArrivalTime(arrival.current);
      if (arrival.current >= 3) changeEventState({ ...eventState, cursor: 1 });
    }
    if (dogFollows) {
      const offset = { x: playerRef.current.x-dogRef.current.x, y: playerRef.current.y-dogRef.current.y };
      const distance = Math.hypot(offset.x, offset.y);
      if (distance > .11) {
        const next = movementStep(dogRef.current, { x: offset.x/distance, y: offset.y/distance }, seconds*.8, (x,y) => canWalk("garden",x,y));
        dogRef.current = next; setDog(next);
      }
    }
    const currentRest = restRef.current;
    if (currentRest) {
      const motion = advanceRest(save.place, "felice", currentRest.motion, seconds);
      const companion = currentRest.companion ? advanceRest(save.place, "elias", currentRest.companion, seconds) : undefined;
      const point = restPosition(currentRest.spot, motion);
      playerRef.current = point; setPlayer(point); setWalking(motion.actor.moving); setWalkFrame(motion.actor.frame); setDirection(motion.actor.direction);
      if (hasLeft(motion) && (!companion || hasLeft(companion))) {
        if (companion) {
          const native = ENTITIES[save.place].find(entity => entity.art === "elias");
          const id = native?.id ?? ELIAS_GUEST.id;
          const updated = { ...actorsRef.current, [id]: companion.actor };
          actorsRef.current = updated; setActors(updated);
          if (!native) setVisitingElias(save.place);
        }
        restRef.current = null; setRest(null);
      } else if (motion !== currentRest.motion || companion !== currentRest.companion) {
        const nextRest = { ...currentRest, motion, companion };
        restRef.current = nextRest; setRest(nextRest);
      }
      return;
    }
    const input = useInput.getState();
    let dx = Math.abs(input.moveX) > .05 ? input.moveX : Number(pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight")) - Number(pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft"));
    let dy = Math.abs(input.moveY) > .05 ? -input.moveY : Number(pressedKeys.has("KeyS") || pressedKeys.has("ArrowDown")) - Number(pressedKeys.has("KeyW") || pressedKeys.has("ArrowUp"));
    const magnitude = Math.hypot(dx,dy);
    if (magnitude <= .02) { setWalking(false); return; }
    if (magnitude > 1) { dx /= magnitude; dy /= magnitude; }
    setDirection(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "right" : "left" : dy > 0 ? "front" : "back");
    const p = playerRef.current;
    const { x, y } = movementStep(p, { x: dx, y: dy }, seconds, (x, y) => canWalk(save.place, x, y));
    const distance = Math.hypot(x-p.x,y-p.y);
    const moved = distance > .00001;
    setWalking(moved);
    if (moved) {
      const previous = Math.floor(walkDistance.current / .054);
      walkDistance.current += distance;
      setWalkFrame(walkingFrame(walkDistance.current));
      if (Math.floor(walkDistance.current / .054) !== previous) worldAudio.play("step");
      playerRef.current = {x,y}; setPlayer({x,y});
    }
  }, [save.place, dogFollows, visitingElias, event, eventState, changeEventState]);

  const interact = useCallback(() => {
    if (!active) return;
    clearMovement();
    worldAudio.play("interact");
    if (event?.scene === "encounter") {
      if (encounterNearby && eventState) setDialogue({ speaker: "Bei den Pferden", text: event.dialogue[Math.min(4, eventState.cursor)].text, action: "encounter", choices: [eventState.cursor >= 4 ? "Diesen Moment bewahren" : "Einen Moment weiter"] });
      return;
    }
    if (rest) {
      if (rest.motion.phase === "leaving") return;
      changeRest({ ...rest, motion: leaveRest(save.place, rest.motion), companion: rest.companion ? leaveRest(save.place, rest.companion) : undefined });
      spendTime(ACTION_MINUTES); return;
    }
    if (restTarget) {
      changeRest({ spot: restTarget, elias: false, motion: beginRest(save.place, playerRef.current, restTarget) }); spendTime(ACTION_MINUTES); return;
    }
    if (nearbyEntity) {
      if (nearbyEntity.id === "graduation-photo" && (step?.target === nearbyEntity.id || save.completed.includes("graduation"))) {
        setPhotoMoment({ target: step?.target === nearbyEntity.id ? nearbyEntity.id : undefined }); return;
      }
      if (nearbyEntity.id === "album") { setJournal(true); return; }
      if (save.place === "kitchen" && nearbyEntity.kind === "item") {
        setDialogue({ speaker: "Felice", text: nearbyEntity.text, action: "kitchen", kitchenId: nearbyEntity.id, choices: [`${nearbyEntity.name} · 10 Min.`, "Zurück ins Spiel"] }); return;
      }
      if (nearbyEntity.id === "school-door" && dayRef.current.minute < SCHOOL_END) {
        setDialogue({ speaker: "Schule", text: `Der Unterricht geht von ${clockText(SCHOOL_START)} bis ${clockText(SCHOOL_END)} Uhr.${dayRef.current.minute < SCHOOL_START ? " Bis zum Beginn wartest du in Ruhe." : " Du gehst in den Unterricht."}`, action: "school", choices: ["Unterricht besuchen", "Noch auf dem Schulhof bleiben"] }); return;
      }
      if (nearbyEntity.id === "photo" || nearbyEntity.id === "shoot") {
        if (nearbyEntity.id === "shoot" && save.chapter === "shooting" && step?.target === "range-host") {
          setDialogue({ speaker: "Felice", text: "Ich begrüße erst kurz die Person am Schießstand." }); return;
        }
        useMemories.getState().enter("goelzau-shooting"); return;
      }
      const matches = step?.place === save.place && step.target === nearbyEntity.id;
      if (!matches && nearbyEntity.kind === "person" && canChangePose(nearbyEntity.art)) {
        const actor = actorsRef.current[nearbyEntity.id];
        const choices = [...(personalConversation(nearbyEntity.id) ? ["Persönlich reden"] : []), ...(spots.some(spot => spot.kind !== "bed") ? ["Hinsetzen"] : []), ...(actor?.pose !== "standing" ? ["Aufstehen"] : []), "Weiterreden"];
        setDialogue({ speaker: nearbyEntity.name, art: nearbyEntity.art, text: `${nearbyEntity.text}\n${actor?.pose === "sitting" ? "Du kannst mich gern wieder zum Aufstehen einladen." : "Ein bisschen Zeit für eine Pause?"}`, actorId: nearbyEntity.id, action: "pose", choices }); return;
      }
      const original = ENTITIES[save.place].find(entity => entity.id === nearbyEntity.id);
      const entitySpeaks = !matches || step.speaker === original?.name;
      setDialogue({ speaker: entitySpeaks ? nearbyEntity.name : step.speaker, art: entitySpeaks && nearbyEntity.kind !== "item" ? nearbyEntity.art : undefined, text: matches ? step.text : nearbyEntity.text, target: matches ? nearbyEntity.id : undefined, choices: matches && nearbyEntity.id === "elias-bus" ? ["Zusammen losgehen", "Ich freue mich auf den Tag mit dir"] : undefined });
    } else if (nearbyExit) {
      setSave({ ...save, place: nearbyExit.to }); position(nearbyExit.spawn); spendTime(TRAVEL_MINUTES, nearbyExit.to);
    }
  }, [active, nearbyEntity, nearbyExit, rest, restTarget, step, save, setSave, spendTime, event, eventState, encounterNearby]);

  function finishDialogue(choice?: string) {
    if (!dialogue) return;
    if (dialogue.action === "calendar") { setDialogue(null); return; }
    if (dialogue.action === "encounter" && eventState) {
      setDialogue(null);
      if (eventState.cursor >= 4) finishCurrentEvent();
      else changeEventState({ ...eventState, cursor: eventState.cursor + 1 });
      return;
    }
    if (dialogue.action === "school") {
      if (choice === "Unterricht besuchen") spendTime(SCHOOL_END - dayRef.current.minute, "school");
      setDialogue(null); clearMovement(); return;
    }
    if (dialogue.action === "kitchen") {
      if (choice !== "Zurück ins Spiel") { spendTime(ACTION_MINUTES); setKitchenEffect(dialogue.kitchenId ?? null); }
      setDialogue(null); clearMovement(); return;
    }
    if (dialogue.action === "pose" && dialogue.actorId && choice === "Persönlich reden") {
      setDialogue({ speaker: dialogue.speaker, art: dialogue.art, text: personalConversation(dialogue.actorId) ?? "Schön, mit dir zu reden." });
      spendTime(ACTION_MINUTES); clearMovement(); return;
    }
    if (dialogue.action === "pose" && dialogue.actorId) {
      if (choice !== "Weiterreden") {
        const pose: Pose = choice === "Aufstehen" ? "standing" : "sitting";
        const actor = actorsRef.current[dialogue.actorId];
        const seat = pose === "standing" ? undefined : availableSeat(save.place, pose, actor.position, actorsRef.current, rest?.spot.id);
        if (pose !== "standing" && !seat) { setDialogue({ speaker: dialogue.speaker, art: dialogue.art, text: "Die Ruheplätze sind gerade belegt. Lass uns später noch einmal schauen." }); return; }
        updateActors({ ...actorsRef.current, [dialogue.actorId]: requestPose(save.place, actor, pose, seat) });
      }
      spendTime(ACTION_MINUTES); setDialogue(null); clearMovement(); return;
    }
    if (!dialogue.ending && !dialogue.morning) spendTime(ACTION_MINUTES);
    if (dialogue.target) {
      const next = advanceStory(save, dialogue.target);
      setSave(next);
      if (!currentStep(next) && chapter) {
        registerLegacyCompletion(chapter.id);
        worldAudio.play("complete");
        setDialogue({ speaker: chapter.title, text: chapter.ending, ending: true }); return;
      }
    }
    if (dialogue.ending && legacyView) restoreDraft();
    setDialogue(null); clearMovement();
  }

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('dialog,input,select,textarea,[contenteditable="true"]')) return;
      if (event.code === "Escape" && started && !transitioning) { event.preventDefault(); useInput.getState().setPaused(!useInput.getState().paused); clearMovement(); return; }
      if (event.code === "KeyJ" && started && inWorld && !paused && !needsLandscape && !phone && !photoMoment && !event.repeat) { event.preventDefault(); clearMovement(); setJournal(v => !v); return; }
      if (!active) return;
      if (["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.code)) {
        event.preventDefault(); pressedKeys.add(event.code);
      }
      if (event.code === "KeyE" && !event.repeat) { event.preventDefault(); interact(); }
    };
    const up = (event: KeyboardEvent) => pressedKeys.delete(event.code);
    const blur = () => { clearMovement(); setWalking(false); if (started) useInput.getState().setPaused(true); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [active, started, inWorld, paused, needsLandscape, transitioning, move, interact, phone, photoMoment]);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      if (!document.hidden) move(Math.min((now-previous)/1000, .1));
      previous = now;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => { window.cancelAnimationFrame(frame); clearMovement(); };
  }, [active,move]);

  function selectChapter(id: ChapterId) {
    if (session) return;
    setLegacyView(previous => previous ?? { save: worldSave, player: rest?.spot.approach ?? playerRef.current, direction });
    const next = beginChapter(save,id);
    setSave(next); changeRest(null); setPhotoMoment(null); position(SPAWNS[next.place]); setJournal(false);
    const c = CHAPTERS.find(c => c.id === id)!;
    setDialogue({ speaker: "Undatierter Szenenentwurf", text: `Fiktionalisierter vorhandener Ablauf. Historisches Datum und genaue Details werden noch ergänzt.\n\n${c.intro}`, action: "calendar" });
  }

  function restoreDraft() {
    if (!legacyView) return;
    setSave({ ...legacyView.save, completed: [...new Set([...legacyView.save.completed, ...worldSave.completed])] });
    position(legacyView.player); setDirection(legacyView.direction); changeRest(null); setLegacyView(null);
  }

  function registerLegacyCompletion(id: ChapterId) {
    const current = timelineRef.current, prior = current.progress[`legacy-${id}`] ?? emptyEvent();
    persistTimeline({ ...current, progress: { ...current.progress, [`legacy-${id}`]: { ...prior, completedAt: prior.completedAt ?? new Date().toISOString(), visits: prior.visits + 1 } } });
  }

  function selectTimelineEvent(id: string, fromPhone = false) {
    const selected = eventById(id);
    if (!selected) return;
    if (selected.scene === "legacy") { if (selected.confirmed && eventStatus(timelineRef.current, selected) !== "gesperrt" && selected.chapter) selectChapter(selected.chapter); return; }
    if (session?.id === id) { setJournal(false); return; }
    if (session) return;
    const status = eventStatus(timelineRef.current, selected);
    if (status === "gesperrt") return;
    const returnPlayer = legacyView?.player ?? rest?.spot.approach ?? playerRef.current;
    const returnDirection = legacyView?.direction ?? direction;
    if (legacyView) restoreDraft();
    if (status === "abgeschlossen") setReplay({ session: { id, returnPlayer, returnDirection }, state: emptyEvent() });
    else persistTimeline(beginEvent(timelineRef.current, id, returnPlayer, returnDirection));
    arrival.current = 0; setArrivalTime(0); setStoryToast(null);
    setJournal(false); setDialogue(null);
    if (fromPhone && rest && selected.place === "bedroom") { clearMovement(); setPhone(true); }
    else { changeRest(null); setPhone(false); position(selected.staging.spawn); }
  }

  function leaveStory() {
    if (!session) return;
    if (replay) { replayRef.current = null; setReplay(null); }
    else persistTimeline({ ...timelineRef.current, active: null });
    setPhone(false); setDialogue(null); setJournal(false); changeRest(null); position(session.returnPlayer); setDirection(session.returnDirection);
  }

  function finishCurrentEvent() {
    if (!session || !event || !eventState) return;
    if (event.scene === "chat" && (eventState.topics.length < 2 || eventState.topic)) return;
    if (event.scene === "love" && eventState.cursor < 2 || event.scene === "encounter" && eventState.cursor < 4) return;
    const current = timelineRef.current;
    if (replay ? !replayRef.current : current.active?.id !== event.id) return;
    persistTimeline(completeEvent(current, event.id, Boolean(replay)));
    replayRef.current = null; setReplay(null); setPhone(false); setDialogue(null); setJournal(false); changeRest(null);
    position(session.returnPlayer); setDirection(session.returnDirection); setStoryToast(event); worldAudio.play("complete");
  }

  function jumpStory() {
    if (session || legacyView) return;
    const next = nextEvent(timelineRef.current);
    if (!next) return;
    persistTimeline(jumpToNext(timelineRef.current));
    setJournal(false); setNotices([]); clearMovement();
    setDialogue({ speaker: "Ein paar Seiten weiter", text: `Die Zeit vergeht in eurem Tempo.\n\n${historicalDate(next.date)} – ${next.scene === "encounter" ? "Bei den Pferden in Radegast wartet die nächste Geschichte." : "Ein gemeinsamer Abend wartet auf Felices Handy. Nimm in ihrem Zimmer am Bett oder Schreibtisch Platz."}`, action: "calendar" });
  }

  function openPhone() {
    if (!settled || !["felice-bed","felice-desk","felice-bed-edge"].includes(rest?.spot.id ?? "")) return;
    if (event && event.scene !== "encounter") { clearMovement(); setPhone(true); }
    else if (upcoming && upcoming.place === "bedroom" && eventStatus(timeline, upcoming) === "verfügbar") selectTimelineEvent(upcoming.id, true);
    else { clearMovement(); setJournal(true); }
  }

  function completePhotos() {
    const target = photoMoment?.target;
    setPhotoMoment(null); clearMovement();
    if (!target) { if (save.completed.includes("graduation")) registerLegacyCompletion("graduation"); return; }
    const next = advanceStory(save, target);
    setSave(next); spendTime(ACTION_MINUTES);
    if (!currentStep(next) && chapter) {
      registerLegacyCompletion(chapter.id);
      worldAudio.play("complete");
      setDialogue({ speaker: chapter.title, text: chapter.ending, ending: true });
    }
  }

  function completeShooting(score: number) {
    worldAudio.play("complete");
    useMemories.getState().complete(score);
    registerLegacyCompletion("shooting");
    if (save.chapter === "shooting" && step?.target === "shoot") setSave(advanceStory(save,"shoot"));
  }

  const completed = datedCompleted + STORY_EVENTS.filter(e => !e.confirmed && timeline.progress[e.id]?.completedAt).length;
  const labelStyle = (p: Point) => ({ left: `${p.x*100}%`, top: `${p.y*100}%` });
  const camera = cameraFor(player);
  const questTarget = step ? step.place === save.place ? sceneEntities.find(e => e.id === step.target) : guide : undefined;
  const arrow = questTarget ? offscreenGuide(questTarget, camera) : null;

  return <main className="game-shell pixel-game version-five version-six version-061 version-065 version-07 version-075 version-08 version-09" data-name-mode={names.visibility} data-scene={inWorld ? save.place : "shooting"} data-chapter={event?.id ?? save.chapter ?? "free"} data-replay={Boolean(replay)} data-atmosphere-active={active} data-minute={day.minute} data-date={day.date} data-day={day.day}>
    <link rel="preload" as="image" href="/rooms/felice-bedroom-rest-v065.png"/>
    <link rel="preload" as="image" href="/characters/rest-poses-v065.png"/>
    <link rel="preload" as="image" href="/characters/neighbors-poses-v065.png"/>
    {Object.keys(WALK_ATLASES).map(sheet => <link key={sheet} rel="preload" as="image" href={sheet}/>)}
    <div className={`pixel-viewport world-viewport ${save.place === "bedroom" ? "bedroom-viewport" : ""}`} hidden={!inWorld && phase !== "entering"} role="group" aria-label={PLACES[save.place].name}>
      <div key={save.place} className="world-scene world-camera" style={{ "--camera-x": `${camera.x*100}%`, "--camera-y": `${camera.y*100}%`, "--world-zoom": camera.zoom } as CSSProperties}>
        {event?.scene === "encounter" ? <RadegastPasture/> : <WorldBackdrop place={save.place} winter={winter} bedOccupied={bedOccupied}/>}
        {event?.scene === "encounter" && <EncounterElias position={eliasPoint} arriving={eventState?.cursor === 0} cursor={eventState?.cursor ?? 0}/>}
        {save.place === "bedroom" && <div className={`world-phone${event ? " has-message" : ""}`} style={labelStyle({ x: .6, y: .265 })} aria-label="Felices Handy auf dem Schreibtisch"><PhoneArt/>{event && <span>!</span>}</div>}
        {save.place === "radegast" && <span className="town-place-label" style={labelStyle({ x: .19, y: .17 })}>{event ? "Radegast · Bei den Pferden" : "Felices Wohnung"}</span>}
        {spots.map(spot => <div key={spot.id} className={`rest-spot rest-${spot.kind}${restTarget?.id === spot.id ? " nearby-rest" : ""}`} style={{...labelStyle(spot.furniture ?? spot.approach), zIndex: Math.round((spot.furniture ?? spot.position).y*100)+8}} aria-label={spot.name}>
          {spot.furniture && <BenchArt winter={winter && save.place === "garden"}/>}
          {restTarget?.id === spot.id && !rest && <span className="entity-name">{spot.name}</span>}
        </div>)}
        {exits.map(exit => <div key={exit.to} className={`world-exit ${guide?.to === exit.to ? "quest-exit" : ""}`} style={labelStyle(exit)}><span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13" fill="none" stroke="currentColor" strokeWidth="2"/></svg></span><small>{exit.label}</small></div>)}
        {sceneEntities.map(entity => <WorldEntity key={entity.id} entity={entity} actor={actors[entity.id]} quest={step?.place === save.place && step.target === entity.id} nearby={active && nearbyEntity?.id === entity.id} />)}
        {save.place === "bedroom" && memoryProgress["goelzau-shooting"] && <span className="room-trophy" style={labelStyle({x:.855,y:.49})} aria-label="Erinnerungsmedaille" data-testid="shooting-medal">✦</span>}
        <div className={`room-player facing-${direction} pose-${restPose}${bedOccupied ? " in-bed" : ""}${walking && active ? " walking" : ""}`} data-testid="felice-player" data-pose={restPose} data-rest-id={rest?.spot.id} data-rest-phase={rest?.motion.phase ?? "none"} data-x={player.x.toFixed(3)} data-y={player.y.toFixed(3)} data-direction={direction} style={{...labelStyle(player),zIndex:bedOccupied ? 80 : Math.round(player.y*100)+10}}>
          {!bedOccupied && <CharacterArt id="felice" direction={direction} walking={walking && active} frame={walkFrame} pose={restPose}/>}<span className="room-player-label">Felice</span>
          {event?.scene === "encounter" && (eventState?.cursor ?? 0) >= 3 && <span className="pixel-chocolate felice-chocolate" aria-label="Felice behält die Schokolade"/>}
        </div>
        {bedOccupied && <span className="bed-name-label" style={labelStyle({ x: .245, y: .10 })}>Felice</span>}
        {rest?.companion && <div className={`room-player pose-${rest.companion.actor.pose} bench-companion`} style={{...labelStyle(rest.companion.actor.position), zIndex: Math.round(rest.companion.actor.position.y*100)+10}} aria-label={rest.companion.phase === "resting" ? "Elias sitzt neben Felice" : "Elias geht zum Ruheplatz"} data-testid="seated-elias" data-rest-id={rest.spot.id} data-pose={rest.companion.actor.pose}><CharacterArt id="elias" pose={rest.companion.actor.pose} direction={rest.companion.actor.direction} walking={rest.companion.actor.moving} frame={rest.companion.actor.frame}/><span className="room-player-label">Elias</span></div>}
        <WorldAtmosphere place={save.place} winter={winter}/>
        {save.place === "kitchen" && kitchenEffect && <div className={`kitchen-effect kitchen-${kitchenEffect}`} role="status"><span>{kitchenEffect === "breakfast" ? "Frühstück steht bereit" : kitchenEffect === "warm-drink" ? "Dein Getränk ist fertig" : "Die Küche ist aufgeräumt"}</span><i/><i/><i/></div>}
        <div className="daylight-shade" style={{ opacity: (1-light.daylight) * (["garden", "bus", "school", "radegast", "zoerbig","schoolway", "goelzau"].includes(save.place) ? .62 : .18) }} aria-hidden="true"/>
      </div>
      {active && arrow && <div className="offscreen-guide" style={labelStyle(arrow)} role="status" aria-label={`Aufgabenziel: ${step?.label}`}><span style={{ transform: `rotate(${arrow.angle}deg)` }}>➜</span><small>{guide?.label ?? "Dein nächstes Ziel"}</small></div>}
    </div>
    {(phase === "memory" || phase === "leaving") && <ShootingMemory blocked={paused || needsLandscape || transitioning} onComplete={completeShooting} onLeave={useMemories.getState().leave}/>}
    <GameUI started={started} onStart={() => { setStarted(true); if (!session && !save.chapter && !datedCompleted) setJournal(true); }} roomActive={inWorld && !needsLandscape && !journal && !dialogue && !phone && !photoMoment} transitioning={transitioning} place={inWorld ? event?.scene === "encounter" ? "Radegast · Bei den Pferden" : PLACES[save.place].name : "Erinnerung · Gölzau"} completed={completed}/>
    {started && inWorld && !paused && !transitioning && <>
      <div className="day-clock" data-testid="day-clock"><time dateTime={day.date}>{historicalDate(day.date)}</time><strong>Uhrzeit: {clockText(day.minute)}</strong><small>{session ? "Aktuelle Spielzeit · während der Szene pausiert" : `Tag ${day.day} · ${activityAt(save.place, day.minute)}`}</small><label><span>Jahreszeit</span><select aria-label="Jahreszeit" disabled={Boolean(session || legacyView)} value={day.season} onChange={event => persistDay({ ...dayRef.current, season: event.target.value as Season })}>{SEASONS.map(season => <option key={season}>{season}</option>)}</select></label></div>
      {(event || legacyView) && <div className="story-session-bar" role="status"><div><small>{legacyView ? "FIKTIONALISIERTER SZENENENTWURF" : replay ? "ERINNERUNG ERNEUT ERLEBEN" : "KAPITEL 1 · DER ANFANG"}</small><strong>{event ? `${historicalDate(event.date)} · ${event.title}` : "Historisches Datum noch offen"}</strong><span>{event ? "Pausen, Umgebung und Uhrzeit sind inszeniert." : "Ablauf und Dialoge sind noch unbestätigt."}</span></div><button onClick={legacyView ? restoreDraft : leaveStory}>{replay || legacyView ? "Zurück in die Welt" : "Unterbrechen"}</button></div>}
      {notices[0] && active && <aside className="day-notice" role="status" data-testid="day-notice" key={`${notices[0].date}-${notices[0].minute}`}><strong>Uhrzeit: {clockText(notices[0].minute)}</strong><span>{notices[0].label}</span></aside>}
      <button className="journal-button" aria-label="Erinnerungsbuch öffnen" onClick={() => { clearMovement(); setJournal(true); }}>▤ <span>Erinnerungsbuch</span> <kbd>J</kbd></button>
      <aside className="quest-tracker" aria-live="polite"><small>{event ? "KAPITEL 1 · DER ANFANG" : chapter ? `Undatierter Entwurf · ${Math.min(save.step+1,chapter.steps.length)}/${chapter.steps.length}` : `Version 0.9 · ${datedCompleted}/14 Erinnerungen`}</small><strong>{event?.title ?? chapter?.title ?? "Schritt für Schritt"}</strong><p>{event ? event.scene === "encounter" ? eventState?.cursor === 0 ? "Elias kommt auf seinem Fahrrad an. Du kannst schon zu ihm laufen." : eventState?.cursor === 1 ? "Geh zu Elias auf dem Weg bei den Pferden." : eventState?.cursor === 2 ? "Elias hat Schokolade für dich mitgebracht." : eventState?.cursor === 3 ? "Du behältst die Schokolade bei dir und isst sie nicht." : "Elias ist ein bisschen verunsichert. Lasst dem Moment etwas Zeit." : "Nimm auf der Bettkante oder am Schreibtisch Platz und öffne dein Handy." : step?.label ?? (upcoming ? `${historicalDate(upcoming.date)} · ${upcoming.title}` : "Der Anfang ist bewahrt. Entdecke eure Welt und die vorbereiteten Geschichten im Buch.")}</p>{!session && !legacyView && upcoming && <button className="story-next-button" onClick={eventStatus(timeline, upcoming) === "verfügbar" ? () => selectTimelineEvent(upcoming.id) : jumpStory}>{eventStatus(timeline,upcoming) === "verfügbar" ? "Geschichte erleben →" : "Zeit weiterblättern →"}</button>}{step && <span>{step.place === save.place ? "✦ Folge der goldenen Markierung" : `↗ ${guide?.label ?? PLACES[step.place].name}`}</span>}{save.bag.length > 0 && <div className="inventory">Tasche · {save.bag.join(" · ")}</div>}</aside>
      {active && rest && <div className="memory-interaction rest-actions"><span>{!settled ? rest.motion.phase === "leaving" ? "Du stehst auf" : "Du gehst zum Ruheplatz" : rest.spot.kind === "bed" ? "Du liegst wach im Bett" : rest.elias ? "Ein Moment mit Elias" : rest.spot.kind === "chair" ? "Du sitzt gemütlich" : "Du sitzt auf der Bank"}</span><button data-testid="world-interact" disabled={rest.motion.phase === "leaving"} onClick={interact}><kbd>E</kbd>Aufstehen · 10 Min.</button>{settled && (rest.spot.kind === "bed" && !event ? <button disabled={Boolean(legacyView) || day.date === STORY_END && day.minute >= 300} onClick={() => { setNotices([]); persistDay(sleepTimelineClock(dayRef.current)); position(rest.spot.approach); changeRest(null); setDialogue({ speaker: "Felice", text: "Ein neuer Morgen. Es ist 5:00 Uhr. Du bist ausgeschlafen.", morning: true }); }}>Schlafen bis 5:00 Uhr</button> : <><button onClick={() => spendTime(ACTION_MINUTES)}>Ausruhen · 10 Min.</button>{!event && !rest.elias && <button onClick={() => { const native = sourceEntities.find(entity => entity.art === "elias");
        const start = native ? actorsRef.current[native.id]?.position ?? native : SPAWNS[save.place];
        const shift = canWalk(save.place, rest.spot.approach.x + .07, rest.spot.approach.y) ? .07 : -.07;
        const companionSpot = { ...rest.spot, position: rest.spot.companion ?? rest.spot.position, approach: { x: rest.spot.approach.x + shift, y: rest.spot.approach.y } };
        changeRest({ ...rest, elias: true, companion: beginRest(save.place, start, companionSpot) }); spendTime(ACTION_MINUTES); }}>Mit Elias sitzen</button>}</>)}{settled && save.place === "bedroom" && ["felice-bed","felice-desk","felice-bed-edge"].includes(rest.spot.id) && <button className="phone-open-button" onClick={openPhone}>▣ Handy öffnen{event?.scene === "love" ? " · Neue Nachricht" : ""}</button>}</div>}
      {active && !rest && target && <div className="memory-interaction"><span>{targetName}</span><button data-testid="world-interact" onClick={interact}><kbd>E</kbd>{restTarget ? restTarget.kind === "bed" ? "Hinlegen · 10 Min." : "Hinsetzen · 10 Min." : nearbyEntity ? nearbyEntity.id === "school-door" && day.minute < SCHOOL_END ? "Unterricht besuchen" : nearbyEntity.kind === "person" || nearbyEntity.kind === "dog" ? "Ansprechen · 10 Min." : save.place === "kitchen" ? "Aktion wählen" : "Anschauen / benutzen" : "Weitergehen · 30 Min."}</button></div>}
      {active && encounterNearby && <div className="memory-interaction encounter-actions"><span>Bei den Pferden · Elias</span><button data-testid="world-interact" onClick={interact}><kbd>E</kbd>{eventState?.cursor === 1 ? "Gespräch beginnen" : eventState?.cursor === 2 ? "Schokolade annehmen" : eventState?.cursor === 3 ? "Schokolade bei dir behalten" : "Einen Moment bleiben"}</button></div>}
      {!save.chapter && <div className="world-welcome">Dein Zimmer ist erst der Anfang. Geh durch die Tür oder öffne das Buch.</div>}
    </>}
    {photoMoment && <GraduationPhotos blocked={paused || needsLandscape} onComplete={completePhotos}/> }
    {phone && event && eventState && <StoryPhone event={event} state={eventState} replay={Boolean(replay)} paused={paused} onPause={() => { if (paused) void worldAudio.unlock(); useInput.getState().setPaused(!paused); clearMovement(); }} blocked={paused || needsLandscape} onChange={changeEventState} onClose={() => { setPhone(false); clearMovement(); }} onComplete={finishCurrentEvent}/>}
    {storyToast && started && <aside className={`story-unlocked${storyToast.special ? " special-memory" : ""}`} role="status"><span aria-hidden="true">{storyToast.special ? "♥" : "✦"}</span><div><small>ERINNERUNG BEWAHRT</small><strong>{historicalDate(storyToast.date)} · {storyToast.title}</strong></div><button onClick={() => { setStoryToast(null); clearMovement(); setJournal(true); }}>Im Buch ansehen</button><button aria-label="Erinnerungshinweis schließen" onClick={() => setStoryToast(null)}>×</button></aside>}
    {journal && <dialog ref={journalRef} className="story-modal journal-modal" onCancel={() => { setJournal(false); clearMovement(); }}>
      <div className="journal-heading"><div><small>FELICE × ELIAS · VERSION 0.9</small><h1>Unsere Geschichte, Seite für Seite</h1><p>{datedCompleted} datierte Erinnerungen bewahrt · Historische Daten bleiben beim Wiederholen erhalten.</p></div><div className="journal-duo" aria-label="Felice und Elias"><CharacterArt id="felice"/><CharacterArt id="elias"/></div><button className="modal-close" aria-label="Erinnerungsbuch schließen" onClick={() => setJournal(false)}>×</button></div>
      <TimelineJournal save={timeline} busyId={session?.id} draftActive={Boolean(legacyView)} onSelect={selectTimelineEvent} onJump={jumpStory} onDraft={e => { if(e.chapter) selectChapter(e.chapter); }} onCalendarEnd={() => { if(!session && !legacyView) { persistDay(clockAtLeast(dayRef.current, STORY_END, 300)); setJournal(false); setDialogue({ speaker: "Der Kalender bleibt offen", text: "02.11.2026 – Das Ende des vorgesehenen Story-Zeitraums. Für die Zeit nach dem ersten Kapitel stehen noch keine bestätigten Ereignisdaten fest. Eure Erinnerungen lassen sich weiter im Buch erleben.", action: "calendar" }); } }}/>
      <WorldMap place={save.place}/>
      <NamesPanel save={names} error={namesError} onRename={changeName} onVisibility={mode => persistNames({ ...namesRef.current, visibility: mode })}/>
      <div className="journal-bottom"><section><h2>Eure Orte</h2><p>Wohnung / Garten ↔ Radegast ↔ Haltestelle ↔ Zörbig · Markt ↔ Schulweg ↔ Pausenhof ↔ Turnhalle. Von Radegast nach Gölzau zum Schützenhaus.</p><p>WASD / Pfeile oder Joystick · E zum Sprechen & Benutzen · J für das Buch · Esc für Pause</p><small>Fortschritt wird automatisch auf diesem Gerät gespeichert. Ergänzte Dialoge und Szenen sind fiktionalisierte Rekonstruktionen. Historische Angaben und Spielzeit werden getrennt gespeichert.</small></section><button className="memory-primary" onClick={() => setJournal(false)}>Zurück ins Spiel</button></div>
    </dialog>}
    {dialogue && <dialog ref={dialogueRef} className={`story-modal dialogue-modal ${dialogue.ending ? "chapter-ending" : ""}`} onCancel={e => { e.preventDefault(); setDialogue(null); clearMovement(); }}>
      <div className="dialogue-portrait">{dialogue.ending ? <span>♥</span> : dialogue.speaker === "Felice & Elias" ? <div className="dialogue-duo"><CharacterArt id="felice" portrait/><CharacterArt id="elias" portrait/></div> : dialogue.art || speakerGraphic(dialogue.speaker) ? <CharacterArt id={dialogue.art ?? speakerGraphic(dialogue.speaker)!} portrait/> : <span>✦</span>}</div>
      <div><small>{dialogue.morning ? "NEUER TAG" : dialogue.ending ? "ERINNERUNG BEWAHRT" : dialogue.action === "encounter" ? "19.11.2025 · SPIELERISCHE INSZENIERUNG" : dialogue.action === "calendar" ? "STORY-KALENDER" : "FIKTIONALISIERTER DIALOG"}</small><h2>{dialogue.speaker}</h2><p>{dialogue.text}</p>{dialogue.ending && <p className="reward-line">✦ {chapter?.reward}</p>}<div className="dialogue-actions">{(dialogue.choices ?? [dialogue.morning ? "Guten Morgen" : dialogue.ending ? "Das bleibt ♥" : dialogue.target ? "Weiter" : "Zurück ins Spiel"]).map(choice => <button className="memory-primary" key={choice} onClick={() => finishDialogue(choice)}>{choice}</button>)}</div></div>
    </dialog>}
    {(saveError || memoryError) && started && <div className="memory-save-warning" role="status">{saveError ?? memoryError}<button onClick={() => {
      if (memoryError) useMemories.getState().retrySave();
      if (saveError) { try { parseStory(window.localStorage.getItem(STORY_KEY)); if (!readable.current) { setSaveError("Bitte lade die Seite neu, um den wieder lesbaren Spielstand sicher fortzusetzen."); return; } window.localStorage.setItem(STORY_KEY,JSON.stringify(save)); setSaveError(null); } catch { setSaveError("Speichern bleibt nicht möglich. Bitte erlaube lokale Browserdaten für das Spiel."); } }
    }}>Erneut speichern</button></div>}
    {dayError && started && <div className="day-save-warning" role="status">{dayError}{timelineReadable.current && <button onClick={() => persistTimeline(timelineRef.current)}>Erneut speichern</button>}</div>}
    <MemoryTransition/>
    {needsLandscape && <div className="rotate-screen" role="status"><div className="rotate-phone">↻</div><strong>Handy bitte quer halten</strong><span>Im Querformat ist genug Platz für eure Welt und den Joystick.</span></div>}
  </main>;
}

function WorldEntity({ entity, actor, quest, nearby }: { entity: Entity; actor?: Actor; quest: boolean; nearby: boolean }) {
  const point = entity.display ?? entity;
  const pose = actor?.pose ?? "standing";
  return <div className={`world-entity entity-${entity.kind} pose-${pose} ${actor?.moving ? "actor-walking" : ""} ${quest ? "quest-entity" : ""} ${nearby ? "nearby-entity" : ""}`} data-entity={entity.id} data-rest-id={actor?.restId} data-friend={!["mother","stepfather","halfsister","partner-one","stepsister","partner-two"].includes(entity.art)} data-pose={pose} data-moving={actor?.moving ?? false} data-x={point.x.toFixed(3)} data-y={point.y.toFixed(3)} style={{...(entity.kind !== "item" ? characterStyle(entity.kind === "dog" ? "dog" : entity.art) : {}),left:`${point.x*100}%`,top:`${point.y*100}%`,zIndex:entity.display ? 110 : Math.round(entity.y*100)+9}} aria-label={entity.name}>
    {quest && <span className="quest-marker">!</span>}{entity.kind === "person" ? <CharacterArt id={entity.art} pose={pose} walking={actor?.moving} frame={actor?.frame} direction={actor?.direction}/> : entity.kind === "dog" ? <CharacterArt id="dog"/> : entity.art === "action" ? <span className="kitchen-action-marker" aria-hidden="true">✦</span> : entity.art === "landmark" ? <span className="landmark-marker" aria-hidden="true">◇</span> : <ItemArt art={entity.art}/>}<span className="entity-name">{entity.name}</span>
  </div>;
}

const ELIAS_GUEST: Entity = { id: "elias-guest", name: "Elias", x: .5, y: .7, kind: "person", art: "elias", text: "Ich bleibe noch ein bisschen bei dir. Machen wir zusammen eine Pause?" };
