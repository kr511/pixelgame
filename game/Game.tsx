"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { GameUI } from "./GameUI";
import { pressedKeys, useInput } from "./input";
import { useMemories } from "./memories/store";
import { MemoryTransition } from "./memories/MemoryTransition";
import { ShootingMemory } from "./memories/ShootingMemory";
import { ItemArt } from "./SceneArt";
import { BenchArt, CharacterArt, WorldAtmosphere, WorldBackdrop, characterStyle } from "./WorldArt";
import { movementStep, walkingFrame } from "./motion";
import { CHAPTER_GRAPHICS, speakerGraphic } from "./graphics";
import { cameraFor, offscreenGuide } from "./camera";
import { audioAllowed, worldAudio } from "./audio";
import { ACTION_MINUTES, DAY_KEY, REST_SPOTS, SCHOOL_END, SCHOOL_START, SEASONS, TRAVEL_MINUTES, activityAt, advanceClock, clockText, initialDay, parseDay, seasonalLight, sleepUntilMorning, type DaySave, type RestSpot, type Season } from "./day";
import { CHAPTERS, ENTITIES, PLACES, SPAWNS, STORY_KEY, EMPTY_STORY, advanceStory, beginChapter, canWalk, currentStep, parseStory, routeTo, type ChapterId, type Entity, type Point, type StorySave } from "./story";

type Direction = "front" | "left" | "back" | "right";
type Dialogue = { speaker: string; text: string; target?: string; ending?: boolean; choices?: string[]; action?: "school"; morning?: boolean };
type Rest = { spot: RestSpot; elias: boolean };
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
  const [notices, setNotices] = useState<Notice[]>([]);
  const [rest, setRest] = useState<Rest | null>(null);
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
  const sceneEntities = ENTITIES[save.place].filter(e => !rest?.elias || e.art !== "elias").map(e => e.id === "anuk" && dogFollows ? { ...e, ...dog } : e);
  const nearbyExit = exits.find(e => Math.hypot(e.x-player.x, e.y-player.y) < .105);
  const nearbyEntity = sceneEntities.map(e => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y), companion: e.id === "anuk" && save.completed.includes("dog") && save.chapter !== "dog" })).filter(v => v.d < .115 && !(v.companion && nearbyExit)).sort((a,b) => Number(a.companion)-Number(b.companion) || a.d-b.d)[0]?.e;
  const spots = REST_SPOTS.filter(spot => spot.place === save.place);
  const nearbySpot = spots.filter(spot => Math.hypot(spot.approach.x-player.x,spot.approach.y-player.y) < .115).sort((a,b) => Math.hypot(a.approach.x-player.x,a.approach.y-player.y)-Math.hypot(b.approach.x-player.x,b.approach.y-player.y))[0];
  const restTarget = nearbySpot && (!nearbyEntity || Math.hypot(nearbySpot.approach.x-player.x,nearbySpot.approach.y-player.y) < Math.hypot(nearbyEntity.x-player.x,nearbyEntity.y-player.y)) ? nearbySpot : undefined;
  const target = restTarget ?? nearbyEntity ?? nearbyExit;
  const targetName = restTarget?.name ?? nearbyEntity?.name ?? nearbyExit?.label;
  const light = seasonalLight(day.season, day.minute);
  const winter = day.season === "Winter" || save.chapter === "christmas";

  function position(point: Point) { playerRef.current = point; setPlayer(point); setWalking(false); clearMovement(); }
  const setSave = useCallback((next: StorySave) => {
    setStory(next);
    if (!readable.current) return;
    try { window.localStorage.setItem(STORY_KEY, JSON.stringify(next)); setSaveError(null); }
    catch { setSaveError("Speichern ist gerade nicht möglich. Dein Fortschritt bleibt für diese Sitzung erhalten."); }
  }, []);
  const persistDay = useCallback((next: DaySave) => {
    dayRef.current = next; setDay(next);
    if (!dayReadable.current) return;
    try { window.localStorage.setItem(DAY_KEY, JSON.stringify(next)); setDayError(null); }
    catch { setDayError("Deine Uhrzeit bleibt für diese Sitzung erhalten. Der Tagesstand konnte nicht gespeichert werden."); }
  }, []);
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
    if (dogFollows) {
      const offset = { x: playerRef.current.x-dogRef.current.x, y: playerRef.current.y-dogRef.current.y };
      const distance = Math.hypot(offset.x, offset.y);
      if (distance > .11) {
        const next = movementStep(dogRef.current, { x: offset.x/distance, y: offset.y/distance }, seconds*.8, (x,y) => canWalk("garden",x,y));
        dogRef.current = next; setDog(next);
      }
    }
    if (rest) { setWalking(false); return; }
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
  }, [save.place, rest, dogFollows]);

  const interact = useCallback(() => {
    if (!active) return;
    clearMovement();
    worldAudio.play("interact");
    if (rest) { position(rest.spot.approach); setRest(null); spendTime(ACTION_MINUTES); return; }
    if (restTarget) {
      position(restTarget.position); setDirection("front"); setRest({ spot: restTarget, elias: false }); spendTime(ACTION_MINUTES); return;
    }
    if (nearbyEntity) {
      if (nearbyEntity.id === "album") { setJournal(true); return; }
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
      setDialogue({ speaker: matches ? step.speaker : nearbyEntity.name, text: matches ? step.text : nearbyEntity.text, target: matches ? nearbyEntity.id : undefined, choices: matches && nearbyEntity.id === "elias-bus" ? ["Zusammen losgehen", "Ich freue mich auf den Tag mit dir"] : undefined });
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
    setSave(next); setRest(null); position(SPAWNS[next.place]); setJournal(false);
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

  return <main className="game-shell pixel-game version-five version-six version-061" data-scene={inWorld ? save.place : "shooting"} data-chapter={save.chapter ?? "free"} data-atmosphere-active={active} data-minute={day.minute} data-day={day.day}>
    <link rel="preload" as="image" href="/characters/rest-poses-v061.png"/>
    <div className={`pixel-viewport world-viewport ${save.place === "bedroom" ? "bedroom-viewport" : ""}`} hidden={!inWorld && phase !== "entering"} role="group" aria-label={PLACES[save.place].name}>
      <div key={save.place} className="world-scene world-camera" style={{ "--camera-x": `${camera.x*100}%`, "--camera-y": `${camera.y*100}%`, "--world-zoom": camera.zoom } as CSSProperties}>
        <WorldBackdrop place={save.place} winter={winter}/>
        {spots.map(spot => <div key={spot.id} className={`rest-spot rest-${spot.kind}${restTarget?.id === spot.id ? " nearby-rest" : ""}`} style={{...labelStyle(spot.furniture ?? spot.approach), zIndex: Math.round((spot.furniture ?? spot.position).y*100)+8}} aria-label={spot.name}>
          {spot.furniture && <BenchArt winter={winter && save.place === "garden"}/>}
          {restTarget?.id === spot.id && !rest && <span className="entity-name">{spot.name}</span>}
        </div>)}
        {exits.map(exit => <div key={exit.to} className={`world-exit ${guide?.to === exit.to ? "quest-exit" : ""}`} style={labelStyle(exit)}><span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13" fill="none" stroke="currentColor" strokeWidth="2"/></svg></span><small>{exit.label}</small></div>)}
        {sceneEntities.map(entity => <WorldEntity key={entity.id} entity={entity} quest={step?.place === save.place && step.target === entity.id} nearby={active && nearbyEntity?.id === entity.id} />)}
        {save.place === "bedroom" && memoryProgress["goelzau-shooting"] && <span className="room-trophy" style={labelStyle({x:.855,y:.49})} aria-label="Erinnerungsmedaille" data-testid="shooting-medal">✦</span>}
        <div className={`room-player facing-${direction}${rest ? ` pose-${rest.spot.kind === "bed" ? "lying" : "sitting"}` : ""}${walking && active ? " walking" : ""}`} data-testid="felice-player" data-pose={rest ? rest.spot.kind === "bed" ? "lying" : "sitting" : "standing"} data-x={player.x.toFixed(3)} data-y={player.y.toFixed(3)} data-direction={direction} style={{...labelStyle(player),zIndex:rest?.spot.kind === "bed" ? 80 : Math.round(player.y*100)+10}}>
          <CharacterArt id="felice" direction={direction} walking={walking && active} frame={walkFrame} pose={rest ? rest.spot.kind === "bed" ? "lying" : "sitting" : "standing"}/><span className="room-player-label">Felice</span>
        </div>
        {rest?.spot.kind === "bed" && <svg className="bed-duvet" viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="bed-duvet-mask"><path d="M19.5 26Q25.5 25 31.5 26L33 39H18Z"/></clipPath></defs><image href="/rooms/felice-bedroom-v9.png" width="100" height="100" clipPath="url(#bed-duvet-mask)"/><path d="M19.5 26Q25.5 25 31.5 26" fill="none" stroke="#675148" strokeWidth=".35"/></svg>}
        {rest?.elias && <div className="room-player pose-sitting bench-companion" style={{...labelStyle(rest.spot.companion ?? player), zIndex: Math.round(player.y*100)+10}} aria-label="Elias sitzt neben Felice" data-testid="seated-elias"><CharacterArt id="elias" pose="sitting"/><span className="room-player-label">Elias</span></div>}
        <WorldAtmosphere place={save.place} winter={winter}/>
        <div className="daylight-shade" style={{ opacity: (1-light.daylight) * (["garden", "bus", "school"].includes(save.place) ? .62 : .18) }} aria-hidden="true"/>
      </div>
      {active && arrow && <div className="offscreen-guide" style={labelStyle(arrow)} role="status" aria-label={`Aufgabenziel: ${step?.label}`}><span style={{ transform: `rotate(${arrow.angle}deg)` }}>➜</span><small>{guide?.label ?? "Dein nächstes Ziel"}</small></div>}
    </div>
    {(phase === "memory" || phase === "leaving") && <ShootingMemory blocked={paused || needsLandscape || transitioning} onComplete={completeShooting} onLeave={useMemories.getState().leave}/>}
    <GameUI started={started} onStart={() => { setStarted(true); if (!save.chapter && !save.completed.length) setJournal(true); }} roomActive={inWorld && !needsLandscape && !journal && !dialogue} transitioning={transitioning} place={inWorld ? PLACES[save.place].name : "Erinnerung · Gölzau"} completed={completed}/>
    {started && inWorld && !paused && !transitioning && <>
      <div className="day-clock" data-testid="day-clock"><strong>Uhrzeit: {clockText(day.minute)}</strong><small>Tag {day.day} · {activityAt(save.place, day.minute)}</small><label><span>Jahreszeit</span><select aria-label="Jahreszeit" value={day.season} onChange={event => persistDay({ ...dayRef.current, season: event.target.value as Season })}>{SEASONS.map(season => <option key={season}>{season}</option>)}</select></label></div>
      {notices[0] && active && <aside className="day-notice" role="status" data-testid="day-notice" key={`${notices[0].date}-${notices[0].minute}`}><strong>Uhrzeit: {clockText(notices[0].minute)}</strong><span>{notices[0].label}</span></aside>}
      <button className="journal-button" aria-label="Erinnerungsbuch öffnen" onClick={() => { clearMovement(); setJournal(true); }}>▤ <span>Erinnerungsbuch</span> <kbd>J</kbd></button>
      <aside className="quest-tracker" aria-live="polite"><small>{chapter ? `${chapter.date} · ${Math.min(save.step+1,chapter.steps.length)}/${chapter.steps.length}` : "Version 0.61 · Frei erkunden"}</small><strong>{chapter?.title ?? "Eure kleine Welt"}</strong><p>{step?.label ?? (chapter ? "Kapitel bewahrt ♥ Wähle im Buch die nächste Geschichte." : "Schule: 7:15–13:00 Uhr. Triff deine Freunde oder ruh dich auf einer Bank aus.")}</p>{step && <span>{step.place === save.place ? "✦ Folge der goldenen Markierung" : `↗ ${guide?.label ?? PLACES[step.place].name}`}</span>}{save.bag.length > 0 && <div className="inventory">Tasche · {save.bag.join(" · ")}</div>}</aside>
      {active && rest && <div className="memory-interaction rest-actions"><span>{rest.spot.kind === "bed" ? "Du liegst wach im Bett" : rest.elias ? "Ein Moment mit Elias" : "Du sitzt auf der Bank"}</span><button data-testid="world-interact" onClick={interact}><kbd>E</kbd>Aufstehen · 10 Min.</button>{rest.spot.kind === "bed" ? <button onClick={() => { setNotices([]); persistDay(sleepUntilMorning(dayRef.current)); position(rest.spot.approach); setRest(null); setDialogue({ speaker: "Felice", text: "Ein neuer Morgen. Es ist 5:00 Uhr. Du bist ausgeschlafen.", morning: true }); }}>Schlafen bis 5:00 Uhr</button> : <><button onClick={() => spendTime(ACTION_MINUTES)}>Ausruhen · 10 Min.</button>{!rest.elias && <button onClick={() => { setRest({ ...rest, elias: true }); spendTime(ACTION_MINUTES); }}>Mit Elias sitzen</button>}</>}</div>}
      {active && !rest && target && <div className="memory-interaction"><span>{targetName}</span><button data-testid="world-interact" onClick={interact}><kbd>E</kbd>{restTarget ? restTarget.kind === "bed" ? "Hinlegen · 10 Min." : "Hinsetzen · 10 Min." : nearbyEntity ? nearbyEntity.id === "school-door" && day.minute < SCHOOL_END ? "Unterricht besuchen" : nearbyEntity.kind === "person" || nearbyEntity.kind === "dog" ? "Ansprechen · 10 Min." : "Anschauen / benutzen" : "Weitergehen · 30 Min."}</button></div>}
      {!save.chapter && <div className="world-welcome">Dein Zimmer ist erst der Anfang. Geh durch die Tür oder öffne das Buch.</div>}
    </>}
    {journal && <dialog ref={journalRef} className="story-modal journal-modal" onCancel={() => { setJournal(false); clearMovement(); }}>
      <div className="journal-heading"><div><small>FELICE × ELIAS · VERSION 0.61</small><h1>Unsere kleinen Geschichten</h1><p>{completed} von 4 Erinnerungen bewahrt{completed === 4 ? " · Eure erste Spielrunde ist komplett! ♥" : " · Ein Kapitel nach dem anderen, in eurem Tempo."}</p></div><div className="journal-duo" aria-label="Felice und Elias"><CharacterArt id="felice"/><CharacterArt id="elias"/></div><button className="modal-close" aria-label="Erinnerungsbuch schließen" onClick={() => setJournal(false)}>×</button></div>
      <div className="chapter-grid">{CHAPTERS.map((c,i) => <article className={`chapter-card ${save.completed.includes(c.id)?"chapter-done":""}`} key={c.id}><div className="chapter-cover" style={{ backgroundImage: `url(${CHAPTER_GRAPHICS[c.id]})` }}><span className="chapter-symbol">{c.icon}</span></div><small>KAPITEL 0{i+1} {save.completed.includes(c.id) ? "· ✓ BEWAHRT" : ""}</small><h2>{c.title}</h2><time>{c.date}</time><p>{c.intro}</p><button onClick={() => { if (save.chapter === c.id && currentStep(save)) { setJournal(false); return; } selectChapter(c.id); }}>{save.chapter === c.id && step ? "Weiterspielen" : save.completed.includes(c.id) ? "Noch einmal erleben" : "Kapitel beginnen"} <span>→</span></button></article>)}</div>
      <div className="journal-bottom"><section><h2>Eure Orte</h2><p>Zimmer ↔ Zuhause ↔ Garten ↔ Haltestelle ↔ Schule / Gölzau</p><p>WASD / Pfeile oder Joystick · E zum Sprechen & Benutzen · J für das Buch · Esc für Pause</p><small>Fortschritt wird automatisch auf diesem Gerät gespeichert. Die Dialoge sind spielerische Entwürfe eurer Erinnerungen.</small></section><button className="memory-primary" onClick={() => setJournal(false)}>Zurück ins Spiel</button></div>
    </dialog>}
    {dialogue && <dialog ref={dialogueRef} className={`story-modal dialogue-modal ${dialogue.ending ? "chapter-ending" : ""}`} onCancel={e => { e.preventDefault(); setDialogue(null); clearMovement(); }}>
      <div className="dialogue-portrait">{dialogue.ending ? <span>♥</span> : dialogue.speaker === "Felice & Elias" ? <div className="dialogue-duo"><CharacterArt id="felice" portrait/><CharacterArt id="elias" portrait/></div> : speakerGraphic(dialogue.speaker) ? <CharacterArt id={speakerGraphic(dialogue.speaker)!} portrait/> : <span>✦</span>}</div>
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

function WorldEntity({ entity, quest, nearby }: { entity: Entity; quest: boolean; nearby: boolean }) {
  const point = entity.display ?? entity;
  return <div className={`world-entity entity-${entity.kind} ${entity.kind !== "item" ? "character-idle" : ""} ${quest ? "quest-entity" : ""} ${nearby ? "nearby-entity" : ""}`} style={{...(entity.kind !== "item" ? characterStyle(entity.kind === "dog" ? "dog" : entity.art) : {}),left:`${point.x*100}%`,top:`${point.y*100}%`,zIndex:entity.display ? 110 : Math.round(entity.y*100)+9}} aria-label={entity.name}>
    {quest && <span className="quest-marker">!</span>}{entity.kind === "person" ? <CharacterArt id={entity.art}/> : entity.kind === "dog" ? <CharacterArt id="dog"/> : <ItemArt art={entity.art}/>}<span className="entity-name">{entity.name}</span>
  </div>;
}
