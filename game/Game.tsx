"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { GameUI } from "./GameUI";
import { NamesPanel } from "./NamesPanel";
import { WorldMap } from "./WorldMap";
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
import { CHAPTER_GRAPHICS, speakerGraphic } from "./graphics";
import { cameraFor, offscreenGuide } from "./camera";
import { audioAllowed, worldAudio } from "./audio";
import { ACTION_MINUTES, DAY_KEY, REST_SPOTS, SCHOOL_END, SCHOOL_START, SEASONS, TRAVEL_MINUTES, activityAt, advanceClock, clockText, initialDay, parseDay, seasonalLight, sleepUntilMorning, type DaySave, type RestSpot, type Season } from "./day";
import { CHAPTERS, ENTITIES, PLACES, SPAWNS, STORY_KEY, EMPTY_STORY, advanceStory, beginChapter, canWalk, currentStep, parseStory, routeTo, type ChapterId, type Entity, type Place, type Point, type StorySave } from "./story";

type Direction = "front" | "left" | "back" | "right";
type Dialogue = { speaker: string; art?: string; text: string; target?: string; ending?: boolean; choices?: string[]; action?: "school" | "pose" | "kitchen"; actorId?: string; kitchenId?: string; morning?: boolean };
type Rest = { spot: RestSpot; elias: boolean; motion: RestMotion; companion?: RestMotion };
type Notice = { date: string; minute: number; label: string };
function clearMovement() { pressedKeys.clear(); useInput.getState().setMove(0, 0); }

export function Game() {
  const [started, setStarted] = useState(false);
  const [initial] = useState(() => {
    try { return { save: parseStory(window.localStorage.getItem(STORY_KEY)), error: null }; }
    catch { return { save: EMPTY_STORY, error: "Der gespeicherte Spielstand ist nicht lesbar. Er bleibt unangetastet; du kannst für diese Sitzung spielen." }; }
  });
  const [save, setStory] = useState<StorySave>(initial.save);
  const [dayInitial] = useState(() => {
    try { return { save: parseDay(window.localStorage.getItem(DAY_KEY)), error: null }; }
    catch { return { save: initialDay(), error: "Der Tagesstand ist nicht lesbar und bleibt unangetastet. Für diese Sitzung beginnt der Tag um 5 Uhr." }; }
  });
  const [day, setDay] = useState<DaySave>(dayInitial.save);
  const dayRef = useRef(dayInitial.save);
  const dayReadable = useRef(!dayInitial.error);
  const [dayError, setDayError] = useState<string | null>(dayInitial.error);
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
  const [kitchenEffect, setKitchenEffect] = useState<string | null>(null);
  const [player, setPlayer] = useState<Point>(SPAWNS[initial.save.place]);
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
  const active = started && !paused && !needsLandscape && inWorld && !journal && !dialogue;
  const chapter = CHAPTERS.find(c => c.id === save.chapter);
  const step = currentStep(save);
  const exits = PLACES[save.place].exits;
  const guide = step && step.place !== save.place ? routeTo(save.place, step.place) : undefined;
  const dogFollows = save.place === "garden" && save.completed.includes("dog") && save.chapter !== "dog";
  const sourceEntities = [...ENTITIES[save.place], ...(visitingElias === save.place ? [ELIAS_GUEST] : [])].map(entity => ({ ...entity, name: displayName(entity, names) }));
  const sceneEntities = sourceEntities.filter(e => !rest?.elias || e.art !== "elias").map(e => e.id === "anuk" && dogFollows ? { ...e, ...dog } : actors[e.id] ? { ...e, ...actors[e.id].position } : e);
  const nearbyExit = exits.filter(e => Math.hypot(e.x-player.x, e.y-player.y) < .105).sort((a,b) => Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];
  const nearbyEntity = sceneEntities.map(e => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y), companion: e.id === "anuk" && save.completed.includes("dog") && save.chapter !== "dog" })).filter(v => v.d < .115 && !(v.companion && nearbyExit) && (!nearbyExit || v.d < Math.hypot(nearbyExit.x-player.x, nearbyExit.y-player.y))).sort((a,b) => Number(a.companion)-Number(b.companion) || a.d-b.d)[0]?.e;
  const spots = REST_SPOTS.filter(spot => spot.place === save.place);
  const nearbySpot = spots.filter(spot => Math.hypot(spot.approach.x-player.x,spot.approach.y-player.y) < .115 && !Object.values(actors).some(actor => actor.restId?.startsWith(`${spot.id}:`))).sort((a,b) => Math.hypot(a.approach.x-player.x,a.approach.y-player.y)-Math.hypot(b.approach.x-player.x,b.approach.y-player.y))[0];
  const restTarget = nearbySpot && (!nearbyEntity || Math.hypot(nearbySpot.approach.x-player.x,nearbySpot.approach.y-player.y) < Math.hypot(nearbyEntity.x-player.x,nearbyEntity.y-player.y)) && (!nearbyExit || Math.hypot(nearbySpot.approach.x-player.x,nearbySpot.approach.y-player.y) < Math.hypot(nearbyExit.x-player.x,nearbyExit.y-player.y)) ? nearbySpot : undefined;
  const target = restTarget ?? nearbyEntity ?? nearbyExit;
  const targetName = restTarget?.name ?? nearbyEntity?.name ?? nearbyExit?.label;
  const light = seasonalLight(day.season, day.minute);
  const winter = day.season === "Winter" || save.chapter === "christmas";
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
  const persistDay = useCallback((next: DaySave) => {
    dayRef.current = next; setDay(next);
    if (!dayReadable.current) return;
    try { window.localStorage.setItem(DAY_KEY, JSON.stringify(next)); setDayError(null); }
    catch { setDayError("Deine Uhrzeit bleibt für diese Sitzung erhalten. Der Tagesstand konnte nicht gespeichert werden."); }
  }, []);
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
    const result = advanceClock(dayRef.current, minutes);
    persistDay(result.save);
    setNotices(previous => [...previous, ...result.notices.map(notice => ({ ...notice, label: `${activityAt(place, notice.minute % 1440)} · ${PLACES[place].name}` }))]);
  }, [persistDay, save.place]);
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
    for (const entity of [...ENTITIES[save.place], ...(visitingElias === save.place ? [ELIAS_GUEST] : [])]) {
      const actor = next[entity.id];
      if (!actor || restRef.current?.elias && entity.art === "elias") continue;
      const updated = advanceActor(save.place, entity.id, actor, seconds);
      if (updated !== actor) { next[entity.id] = updated; changed = true; }
    }
    if (changed) { actorsRef.current = next; setActors(next); }
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
  }, [save.place, dogFollows, visitingElias]);

  const interact = useCallback(() => {
    if (!active) return;
    clearMovement();
    worldAudio.play("interact");
    if (rest) {
      if (rest.motion.phase === "leaving") return;
      changeRest({ ...rest, motion: leaveRest(save.place, rest.motion), companion: rest.companion ? leaveRest(save.place, rest.companion) : undefined });
      spendTime(ACTION_MINUTES); return;
    }
    if (restTarget) {
      changeRest({ spot: restTarget, elias: false, motion: beginRest(save.place, playerRef.current, restTarget) }); spendTime(ACTION_MINUTES); return;
    }
    if (nearbyEntity) {
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
        spendTime(ACTION_MINUTES); useMemories.getState().enter("goelzau-shooting"); return;
      }
      const matches = step?.place === save.place && step.target === nearbyEntity.id;
      if (!matches && nearbyEntity.kind === "person" && canChangePose(nearbyEntity.art)) {
        const actor = actorsRef.current[nearbyEntity.id];
        const choices = ["Hinsetzen", "Hinlegen", "Aufstehen", "Weiterreden"];
        setDialogue({ speaker: nearbyEntity.name, art: nearbyEntity.art, text: `${nearbyEntity.text}\n${actor?.pose === "sitting" ? "Du kannst mich gern wieder zum Aufstehen einladen." : actor?.pose === "lying" ? "Hier auf der Decke kann man gut ausruhen." : "Ein bisschen Zeit für eine Pause?"}`, actorId: nearbyEntity.id, action: "pose", choices }); return;
      }
      const original = ENTITIES[save.place].find(entity => entity.id === nearbyEntity.id);
      const entitySpeaks = !matches || step.speaker === original?.name;
      setDialogue({ speaker: entitySpeaks ? nearbyEntity.name : step.speaker, art: entitySpeaks && nearbyEntity.kind !== "item" ? nearbyEntity.art : undefined, text: matches ? step.text : nearbyEntity.text, target: matches ? nearbyEntity.id : undefined, choices: matches && nearbyEntity.id === "elias-bus" ? ["Zusammen losgehen", "Ich freue mich auf den Tag mit dir"] : undefined });
    } else if (nearbyExit) {
      setSave({ ...save, place: nearbyExit.to }); position(nearbyExit.spawn); spendTime(TRAVEL_MINUTES, nearbyExit.to);
    }
  }, [active, nearbyEntity, nearbyExit, rest, restTarget, step, save, setSave, spendTime]);

  function finishDialogue(choice?: string) {
    if (!dialogue) return;
    if (dialogue.action === "school") {
      if (choice === "Unterricht besuchen") spendTime(SCHOOL_END - dayRef.current.minute, "school");
      setDialogue(null); clearMovement(); return;
    }
    if (dialogue.action === "kitchen") {
      if (choice !== "Zurück ins Spiel") { spendTime(ACTION_MINUTES); setKitchenEffect(dialogue.kitchenId ?? null); }
      setDialogue(null); clearMovement(); return;
    }
    if (dialogue.action === "pose" && dialogue.actorId) {
      if (choice !== "Weiterreden") {
        const pose: Pose = choice === "Aufstehen" ? "standing" : choice === "Hinlegen" ? "lying" : "sitting";
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
        worldAudio.play("complete");
        setDialogue({ speaker: chapter.title, text: chapter.ending, ending: true }); return;
      }
    }
    setDialogue(null); clearMovement();
  }

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('dialog,input,select,textarea,[contenteditable="true"]')) return;
      if (event.code === "Escape" && started && !transitioning) { event.preventDefault(); useInput.getState().setPaused(!useInput.getState().paused); clearMovement(); return; }
      if (event.code === "KeyJ" && started && inWorld && !paused && !needsLandscape && !event.repeat) { event.preventDefault(); clearMovement(); setJournal(v => !v); return; }
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
  }, [active, started, inWorld, paused, needsLandscape, transitioning, move, interact]);

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
    const next = beginChapter(save,id);
    setSave(next); changeRest(null); position(SPAWNS[next.place]); setJournal(false);
    const c = CHAPTERS.find(c => c.id === id)!;
    setDialogue({ speaker: c.date, text: c.intro });
  }

  function completeShooting(score: number) {
    worldAudio.play("complete");
    useMemories.getState().complete(score);
    if (save.chapter === "shooting" && step?.target === "shoot") setSave(advanceStory(save,"shoot"));
  }

  const completed = save.completed.length;
  const labelStyle = (p: Point) => ({ left: `${p.x*100}%`, top: `${p.y*100}%` });
  const camera = cameraFor(player);
  const questTarget = step ? step.place === save.place ? sceneEntities.find(e => e.id === step.target) : guide : undefined;
  const arrow = questTarget ? offscreenGuide(questTarget, camera) : null;

  return <main className="game-shell pixel-game version-five version-six version-061 version-065 version-07 version-075" data-name-mode={names.visibility} data-scene={inWorld ? save.place : "shooting"} data-chapter={save.chapter ?? "free"} data-atmosphere-active={active} data-minute={day.minute} data-day={day.day}>
    <link rel="preload" as="image" href="/rooms/felice-bedroom-rest-v065.png"/>
    <link rel="preload" as="image" href="/characters/rest-poses-v065.png"/>
    <link rel="preload" as="image" href="/characters/neighbors-poses-v065.png"/>
    {Object.keys(WALK_ATLASES).map(sheet => <link key={sheet} rel="preload" as="image" href={sheet}/>)}
    <div className={`pixel-viewport world-viewport ${save.place === "bedroom" ? "bedroom-viewport" : ""}`} hidden={!inWorld && phase !== "entering"} role="group" aria-label={PLACES[save.place].name}>
      <div key={save.place} className="world-scene world-camera" style={{ "--camera-x": `${camera.x*100}%`, "--camera-y": `${camera.y*100}%`, "--world-zoom": camera.zoom } as CSSProperties}>
        <WorldBackdrop place={save.place} winter={winter} bedOccupied={bedOccupied}/>
        {save.place === "radegast" && <span className="town-place-label" style={labelStyle({ x: .19, y: .17 })}>Felices Wohnung</span>}
        {spots.map(spot => <div key={spot.id} className={`rest-spot rest-${spot.kind}${restTarget?.id === spot.id ? " nearby-rest" : ""}`} style={{...labelStyle(spot.furniture ?? spot.approach), zIndex: Math.round((spot.furniture ?? spot.position).y*100)+8}} aria-label={spot.name}>
          {spot.furniture && (spot.kind === "mat" ? <PicnicArt/> : <BenchArt winter={winter && save.place === "garden"}/>)}
          {restTarget?.id === spot.id && !rest && <span className="entity-name">{spot.name}</span>}
        </div>)}
        {exits.map(exit => <div key={exit.to} className={`world-exit ${guide?.to === exit.to ? "quest-exit" : ""}`} style={labelStyle(exit)}><span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13" fill="none" stroke="currentColor" strokeWidth="2"/></svg></span><small>{exit.label}</small></div>)}
        {sceneEntities.map(entity => <WorldEntity key={entity.id} entity={entity} actor={actors[entity.id]} quest={step?.place === save.place && step.target === entity.id} nearby={active && nearbyEntity?.id === entity.id} />)}
        {save.place === "bedroom" && memoryProgress["goelzau-shooting"] && <span className="room-trophy" style={labelStyle({x:.855,y:.49})} aria-label="Erinnerungsmedaille" data-testid="shooting-medal">✦</span>}
        <div className={`room-player facing-${direction} pose-${restPose}${bedOccupied ? " in-bed" : ""}${walking && active ? " walking" : ""}`} data-testid="felice-player" data-pose={restPose} data-rest-id={rest?.spot.id} data-rest-phase={rest?.motion.phase ?? "none"} data-x={player.x.toFixed(3)} data-y={player.y.toFixed(3)} data-direction={direction} style={{...labelStyle(player),zIndex:bedOccupied ? 80 : Math.round(player.y*100)+10}}>
          {!bedOccupied && <CharacterArt id="felice" direction={direction} walking={walking && active} frame={walkFrame} pose={restPose}/>}<span className="room-player-label">Felice</span>
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
    <GameUI started={started} onStart={() => { setStarted(true); if (!save.chapter && !save.completed.length) setJournal(true); }} roomActive={inWorld && !needsLandscape && !journal && !dialogue} transitioning={transitioning} place={inWorld ? PLACES[save.place].name : "Erinnerung · Gölzau"} completed={completed}/>
    {started && inWorld && !paused && !transitioning && <>
      <div className="day-clock" data-testid="day-clock"><strong>Uhrzeit: {clockText(day.minute)}</strong><small>Tag {day.day} · {activityAt(save.place, day.minute)}</small><label><span>Jahreszeit</span><select aria-label="Jahreszeit" value={day.season} onChange={event => persistDay({ ...dayRef.current, season: event.target.value as Season })}>{SEASONS.map(season => <option key={season}>{season}</option>)}</select></label></div>
      {notices[0] && active && <aside className="day-notice" role="status" data-testid="day-notice" key={`${notices[0].date}-${notices[0].minute}`}><strong>Uhrzeit: {clockText(notices[0].minute)}</strong><span>{notices[0].label}</span></aside>}
      <button className="journal-button" aria-label="Erinnerungsbuch öffnen" onClick={() => { clearMovement(); setJournal(true); }}>▤ <span>Erinnerungsbuch</span> <kbd>J</kbd></button>
      <aside className="quest-tracker" aria-live="polite"><small>{chapter ? `${chapter.date} · ${Math.min(save.step+1,chapter.steps.length)}/${chapter.steps.length}` : "Version 0.75 · Frei erkunden"}</small><strong>{chapter?.title ?? "Eure kleine Welt"}</strong><p>{step?.label ?? (chapter ? "Kapitel bewahrt ♥ Wähle im Buch die nächste Geschichte." : "Freunde treffen, gemeinsam sitzen und eure Welt erkunden. Über Radegast und den Zörbiger Markt zur Schule. Eure Wege und Namen findest du im Buch.")}</p>{step && <span>{step.place === save.place ? "✦ Folge der goldenen Markierung" : `↗ ${guide?.label ?? PLACES[step.place].name}`}</span>}{save.bag.length > 0 && <div className="inventory">Tasche · {save.bag.join(" · ")}</div>}</aside>
      {active && rest && <div className="memory-interaction rest-actions"><span>{!settled ? rest.motion.phase === "leaving" ? "Du stehst auf" : "Du gehst zum Ruheplatz" : rest.spot.kind === "bed" ? "Du liegst wach im Bett" : rest.spot.kind === "mat" ? "Du liegst auf der Decke" : rest.elias ? "Ein Moment mit Elias" : rest.spot.kind === "chair" ? "Du sitzt gemütlich" : "Du sitzt auf der Bank"}</span><button data-testid="world-interact" disabled={rest.motion.phase === "leaving"} onClick={interact}><kbd>E</kbd>Aufstehen · 10 Min.</button>{settled && (rest.spot.kind === "bed" ? <button onClick={() => { setNotices([]); persistDay(sleepUntilMorning(dayRef.current)); position(rest.spot.approach); changeRest(null); setDialogue({ speaker: "Felice", text: "Ein neuer Morgen. Es ist 5:00 Uhr. Du bist ausgeschlafen.", morning: true }); }}>Schlafen bis 5:00 Uhr</button> : <><button onClick={() => spendTime(ACTION_MINUTES)}>Ausruhen · 10 Min.</button>{!rest.elias && rest.spot.kind !== "mat" && <button onClick={() => { const native = sourceEntities.find(entity => entity.art === "elias");
        const start = native ? actorsRef.current[native.id]?.position ?? native : SPAWNS[save.place];
        const shift = canWalk(save.place, rest.spot.approach.x + .07, rest.spot.approach.y) ? .07 : -.07;
        const companionSpot = { ...rest.spot, position: rest.spot.companion ?? rest.spot.position, approach: { x: rest.spot.approach.x + shift, y: rest.spot.approach.y } };
        changeRest({ ...rest, elias: true, companion: beginRest(save.place, start, companionSpot) }); spendTime(ACTION_MINUTES); }}>Mit Elias sitzen</button>}</>)}</div>}
      {active && !rest && target && <div className="memory-interaction"><span>{targetName}</span><button data-testid="world-interact" onClick={interact}><kbd>E</kbd>{restTarget ? restTarget.kind === "bed" || restTarget.kind === "mat" ? "Hinlegen · 10 Min." : "Hinsetzen · 10 Min." : nearbyEntity ? nearbyEntity.id === "school-door" && day.minute < SCHOOL_END ? "Unterricht besuchen" : nearbyEntity.kind === "person" || nearbyEntity.kind === "dog" ? "Ansprechen · 10 Min." : save.place === "kitchen" ? "Aktion wählen" : "Anschauen / benutzen" : "Weitergehen · 30 Min."}</button></div>}
      {!save.chapter && <div className="world-welcome">Dein Zimmer ist erst der Anfang. Geh durch die Tür oder öffne das Buch.</div>}
    </>}
    {journal && <dialog ref={journalRef} className="story-modal journal-modal" onCancel={() => { setJournal(false); clearMovement(); }}>
      <div className="journal-heading"><div><small>FELICE × ELIAS · VERSION 0.75</small><h1>Unsere kleinen Geschichten</h1><p>{completed} von 4 Erinnerungen bewahrt{completed === 4 ? " · Eure erste Spielrunde ist komplett! ♥" : " · Ein Kapitel nach dem anderen, in eurem Tempo."}</p></div><div className="journal-duo" aria-label="Felice und Elias"><CharacterArt id="felice"/><CharacterArt id="elias"/></div><button className="modal-close" aria-label="Erinnerungsbuch schließen" onClick={() => setJournal(false)}>×</button></div>
      <div className="chapter-grid">{CHAPTERS.map((c,i) => <article className={`chapter-card ${save.completed.includes(c.id)?"chapter-done":""}`} key={c.id}><div className="chapter-cover" style={{ backgroundImage: `url(${CHAPTER_GRAPHICS[c.id]})` }}><span className="chapter-symbol">{c.icon}</span></div><small>KAPITEL 0{i+1} {save.completed.includes(c.id) ? "· ✓ BEWAHRT" : ""}</small><h2>{c.title}</h2><time>{c.date}</time><p>{c.intro}</p><button onClick={() => { if (save.chapter === c.id && currentStep(save)) { setJournal(false); return; } selectChapter(c.id); }}>{save.chapter === c.id && step ? "Weiterspielen" : save.completed.includes(c.id) ? "Noch einmal erleben" : "Kapitel beginnen"} <span>→</span></button></article>)}</div>
      <WorldMap place={save.place}/>
      <NamesPanel save={names} error={namesError} onRename={changeName} onVisibility={mode => persistNames({ ...namesRef.current, visibility: mode })}/>
      <div className="journal-bottom"><section><h2>Eure Orte</h2><p>Wohnung / Garten ↔ Radegast ↔ Haltestelle ↔ Zörbig · Markt ↔ Pausenhof. Von Radegast nach Gölzau zum Schützenhaus.</p><p>WASD / Pfeile oder Joystick · E zum Sprechen & Benutzen · J für das Buch · Esc für Pause</p><small>Fortschritt wird automatisch auf diesem Gerät gespeichert. Die Dialoge sind spielerische Entwürfe eurer Erinnerungen.</small></section><button className="memory-primary" onClick={() => setJournal(false)}>Zurück ins Spiel</button></div>
    </dialog>}
    {dialogue && <dialog ref={dialogueRef} className={`story-modal dialogue-modal ${dialogue.ending ? "chapter-ending" : ""}`} onCancel={e => { e.preventDefault(); setDialogue(null); clearMovement(); }}>
      <div className="dialogue-portrait">{dialogue.ending ? <span>♥</span> : dialogue.speaker === "Felice & Elias" ? <div className="dialogue-duo"><CharacterArt id="felice" portrait/><CharacterArt id="elias" portrait/></div> : dialogue.art || speakerGraphic(dialogue.speaker) ? <CharacterArt id={dialogue.art ?? speakerGraphic(dialogue.speaker)!} portrait/> : <span>✦</span>}</div>
      <div><small>{dialogue.morning ? "NEUER TAG" : dialogue.ending ? "ERINNERUNG BEWAHRT" : "EIN MOMENT MIT EUCH"}</small><h2>{dialogue.speaker}</h2><p>{dialogue.text}</p>{dialogue.ending && <p className="reward-line">✦ {chapter?.reward}</p>}<div className="dialogue-actions">{(dialogue.choices ?? [dialogue.morning ? "Guten Morgen" : dialogue.ending ? "Das bleibt ♥" : dialogue.target ? "Weiter" : "Zurück ins Spiel"]).map(choice => <button className="memory-primary" key={choice} onClick={() => finishDialogue(choice)}>{choice}</button>)}</div></div>
    </dialog>}
    {(saveError || memoryError) && started && <div className="memory-save-warning" role="status">{saveError ?? memoryError}<button onClick={() => {
      if (memoryError) useMemories.getState().retrySave();
      if (saveError) { try { parseStory(window.localStorage.getItem(STORY_KEY)); if (!readable.current) { setSaveError("Bitte lade die Seite neu, um den wieder lesbaren Spielstand sicher fortzusetzen."); return; } window.localStorage.setItem(STORY_KEY,JSON.stringify(save)); setSaveError(null); } catch { setSaveError("Speichern bleibt nicht möglich. Bitte erlaube lokale Browserdaten für das Spiel."); } }
    }}>Erneut speichern</button></div>}
    {dayError && started && <div className="day-save-warning" role="status">{dayError}</div>}
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

function PicnicArt() {
  return <svg viewBox="0 0 100 78" aria-hidden="true"><path d="M4 4L96 0 100 73 0 78Z" fill="#c8b58e" stroke="#756f53" strokeWidth="2"/><path d="M4 20L97 16M3 39L98 35M2 58L99 54M23 3L22 76M48 2L48 75M73 1L74 74" stroke="#7b9171" strokeWidth="5" opacity=".65"/><path d="M6 8L92 4 95 68 5 72Z" fill="none" stroke="#f1ddaf" strokeWidth="1"/></svg>;
}

const ELIAS_GUEST: Entity = { id: "elias-guest", name: "Elias", x: .5, y: .7, kind: "person", art: "elias", text: "Ich bleibe noch ein bisschen bei dir. Machen wir zusammen eine Pause?" };
