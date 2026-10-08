import test from "node:test";
import assert from "node:assert/strict";
import { CHAPTERS, EMPTY_STORY, canWalk } from "../game/story.ts";
import { initialDay } from "../game/day.ts";
import { CHAT_TOPICS, STORY_END, STORY_EVENTS, STORY_START, advanceTimelineClock, beginEvent, chatTopicForEvent, completeEvent, emptyEvent, eventById, eventStatus, historicalDate, initialTimeline, jumpToNext, nextEvent, parseTimeline, sleepTimelineClock } from "../game/timeline.ts";

const player = { x: .5, y: .7 };
const finish = save => {
  const event = eventById(save.active.id);
  const state = { ...save.progress[event.id], cursor: event.scene === "love" ? 2 : 4, topics: event.scene === "chat" ? ["space", "collin"] : [], topic: null };
  return completeEvent({ ...save, progress: { ...save.progress, [event.id]: state } }, event.id, false, "2026-10-08T12:00:00Z");
};

test("Neuer Kalender beginnt historisch; alle eindeutigen Ereignisse besitzen erreichbare Schauplätze und Bedingungen", () => {
  const save = initialTimeline();
  assert.equal(save.clock.date, STORY_START);
  assert.equal(save.clock.minute, 300);
  assert.equal(save.clock.season, "Herbst");
  assert.equal(new Set(STORY_EVENTS.map(e=>e.id)).size, STORY_EVENTS.length);
  for (const event of STORY_EVENTS) {
    for (const id of event.requires) assert.ok(eventById(id), id);
    if (event.confirmed) assert.ok(canWalk(event.place, event.staging.spawn.x, event.staging.spawn.y), event.id);
    assert.ok(event.dialogue.length);
    assert.ok(event.interactions.length);
  }
  assert.deepEqual(CHAT_TOPICS.map(t=>t.id), ["computers","space","philosophy","shooting","collin"]);
});

test("Vollständige chronologische Runde verschränkt das Treffen mit den zwölf Chatabenden", () => {
  let save = initialTimeline();
  const visited = [];
  while (nextEvent(save)) {
    const event = nextEvent(save);
    assert.equal(eventStatus(save, event), "gesperrt");
    const love = eventById("first-i-love-you");
    assert.equal(beginEvent(save, love.id, player, "front"), save, "kein Überspringen gesperrter Geschichten");
    save = jumpToNext(save);
    assert.equal(eventStatus(save, event), "verfügbar");
    assert.equal(STORY_EVENTS.filter(e=>eventStatus(save,e)==="verfügbar").length, 1);
    save = beginEvent(save, event.id, player, "left");
    assert.equal(completeEvent(save,event.id), save, "kein Abschluss ohne Interaktion");
    save = parseTimeline(JSON.stringify(finish(save)));
    assert.equal(eventStatus(save,event), "abgeschlossen");
    assert.equal(save.active, null);
    visited.push(event.id);
  }
  assert.equal(visited.length, 14);
  assert.equal(visited[6], "radegast-chocolate");
  assert.equal(visited[7], "chat-2025-11-19");
  assert.equal(visited.at(-1), "first-i-love-you");
  assert.equal(save.clock.date, "2025-11-25");
});

test("Spätere bestehende Spielzeit wird weder beim ersten Erleben noch beim Wiederholen zurückgedreht", () => {
  let save = initialTimeline({ ...initialDay(new Date("2026-10-08T12:00Z")), minute: 1270 });
  const clock = structuredClone(save.clock);
  save = jumpToNext(save);
  assert.deepEqual(save.clock, clock);
  const event = nextEvent(save);
  save = finish(beginEvent(save,event.id,player,"right"));
  const completedAt = save.progress[event.id].completedAt;
  assert.deepEqual(save.clock, clock);
  save = completeEvent(save,event.id,true,"2026-10-09T15:00Z");
  assert.deepEqual(save.clock, clock);
  assert.equal(save.progress[event.id].visits,2);
  assert.equal(save.progress[event.id].completedAt, completedAt);
  assert.equal(historicalDate(event.date),"13.11.2025");
  assert.equal(completeEvent(save,"first-i-love-you",true),save,"gesperrte Erinnerungen sind nicht wiederholbar");
});

test("Unterbrochener Chat übersteht Neuladen; schon gewählte Themen werden nicht als zweites Thema gezählt", () => {
  let save = jumpToNext(initialTimeline());
  const id = nextEvent(save).id;
  save = beginEvent(save,id,player,"front");
  save.progress[id] = { ...emptyEvent(), topics:["space"], topic:"computers", line:1 };
  const reloaded = parseTimeline(JSON.stringify(save));
  assert.deepEqual(reloaded, save);
  assert.equal(reloaded.progress[id].topic,"computers");
  const interrupted = { ...reloaded, active:null };
  const resumed = beginEvent(interrupted,id,player,"front");
  assert.deepEqual(resumed.progress[id], save.progress[id]);
  assert.equal(completeEvent(resumed,id),resumed);
  resumed.progress[id] = { ...emptyEvent(), topics:["space","space"] };
  assert.equal(completeEvent(resumed,id),resumed,"Ein Thema zweimal reicht nicht aus");
  assert.equal(parseTimeline(JSON.stringify(resumed)).progress[id].topics.length,1);
});

test("Migration bewahrt alte Abschlüsse, Saison, Uhrzeit und Schießbestwerte ohne historische Daten zu erfinden", () => {
  const day = { ...initialDay(new Date("2026-03-11T12:00Z")), season:"Sommer", minute:850, day:27 };
  const oldStory = { ...EMPTY_STORY, completed:["dog","christmas","graduation"] };
  const migrated = initialTimeline(day,oldStory,true);
  assert.deepEqual(migrated.clock,day);
  assert.ok(migrated.progress["legacy-dog"].completedAt);
  assert.ok(migrated.progress["legacy-christmas"].completedAt);
  assert.ok(migrated.progress["legacy-shooting"].completedAt);
  assert.ok(migrated.progress["legacy-graduation"].completedAt);
  assert.equal(eventById("legacy-graduation").period,"Sommer 2026");
  for (const event of STORY_EVENTS.filter(e=>e.scene==="legacy")) {
    assert.equal(event.date,null);
    assert.equal(event.confirmed,false);
  }
  assert.equal(eventStatus(initialTimeline(),eventById("legacy-school")),"gesperrt");
  assert.equal(eventStatus(migrated,eventById("legacy-dog")),"abgeschlossen");
  assert.ok(!CHAPTERS.find(c=>c.id==="christmas").ending.includes("25.12.2025"));
});

test("Aktionszeit und Schlaf bleiben innerhalb des ganzen Storyjahrs, alle vier Jahreszeiten bleiben erhalten", () => {
  const last = { ...initialTimeline().clock, date:STORY_END, minute:1430, season:"Winter" };
  assert.equal(advanceTimelineClock(last,30).save.date,STORY_END);
  assert.equal(advanceTimelineClock(last,30).save.minute,1439);
  const atEnd = advanceTimelineClock(last,30).save;
  assert.equal(advanceTimelineClock(atEnd,30).save.day,atEnd.day);
  assert.deepEqual(sleepTimelineClock(atEnd),atEnd);
  assert.equal(sleepTimelineClock(last).date,STORY_END);
  assert.equal(sleepTimelineClock(last).season,"Winter");
  assert.equal(initialTimeline({...last,date:"2024-01-01"}).clock.date,STORY_START);
  assert.equal(initialTimeline({...last,date:"2028-01-01"}).clock.date,STORY_END);
});

test("Chat-Rekonstruktionen entwickeln sich über den Zeitraum weiter, Collin bleibt ohne ergänzte Biografie", () => {
  const first = chatTopicForEvent("space",eventById("chat-2025-11-13"));
  const middle = chatTopicForEvent("space",eventById("chat-2025-11-19"));
  const late = chatTopicForEvent("space",eventById("chat-2025-11-24"));
  assert.notDeepEqual(first.lines,middle.lines);
  assert.notDeepEqual(middle.lines,late.lines);
  assert.deepEqual(chatTopicForEvent("collin",eventById("chat-2025-11-13")).lines,chatTopicForEvent("collin",eventById("chat-2025-11-24")).lines);
});

test("Beschädigte und zukünftige Speicherformate werden abgelehnt; unbekannte gültige IDs bleiben erhalten", () => {
  const save = initialTimeline();
  for (const raw of ["broken", "null", JSON.stringify({...save,version:2}), JSON.stringify({...save,clock:undefined}), JSON.stringify({...save,clock:{...save.clock,date:"2025-02-30"}}), JSON.stringify({...save,progress:{foo:{...emptyEvent(),cursor:-1}}}), JSON.stringify({...save,progress:{foo:{...emptyEvent(),completedAt:1}}}), JSON.stringify({...save,active:{id:"missing"}})]) assert.throws(()=>parseTimeline(raw));
  const withFuture = {...save, progress:{"future-story":emptyEvent()}};
  assert.deepEqual(parseTimeline(JSON.stringify(withFuture)),withFuture);
});
