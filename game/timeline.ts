import { advanceClock, initialDay, parseDay, sleepUntilMorning, type DaySave } from "./day.ts";
import { CHAPTERS, type ChapterId, type Place, type Point, type StorySave } from "./story.ts";

export const TIMELINE_KEY = "felice-elias.timeline.v09";
export const STORY_START = "2025-11-01";
export const STORY_END = "2026-11-02";
export type StoryLine = { speaker: "Felice" | "Elias" | "Erzählung"; text: string };
export type ChatTopic = { id: string; title: string; icon: string; lines: StoryLine[] };
export type StoryEvent = {
  id: string; title: string; date: string | null; until?: string; period?: string; order: number;
  place: Place; scene: "chat" | "encounter" | "love" | "legacy";
  requires: string[]; confirmed: boolean; description: string; illustration: string;
  staging: { start: number; end: number; spawn: Point; timeConfirmed: boolean };
  dialogue: StoryLine[]; interactions: string[]; chapter?: ChapterId; special?: boolean;
};

// These are explicitly fictionalized reconstructions, never original messages.
// Collin's identity and personal circumstances have not been supplied.
export const CHAT_TOPICS: ChatTopic[] = [
  { id: "computers", title: "Programmieren & Computer", icon: "⌨", lines: [
    { speaker: "Felice", text: "Kennst du das, wenn etwas am Computer einfach nicht so will wie du?" },
    { speaker: "Elias", text: "Ja. Und dann findet man den kleinen Fehler, nach dem man die ganze Zeit gesucht hat." },
    { speaker: "Felice", text: "Darüber könnte ich gerade noch eine ganze Weile mit dir schreiben." },
  ] },
  { id: "space", title: "Das Weltall", icon: "✦", lines: [
    { speaker: "Felice", text: "Manchmal denke ich darüber nach, wie viel wir vom Weltall noch gar nicht kennen." },
    { speaker: "Elias", text: "Es gibt so viele Fragen. Wie weit es geht. Was da noch sein könnte." },
    { speaker: "Felice", text: "Ich mag, dass wir zusammen darüber nachdenken können." },
  ] },
  { id: "philosophy", title: "Tod & Gedanken", icon: "☾", lines: [
    { speaker: "Felice", text: "Denkst du manchmal darüber nach, was bleibt, wenn ein Leben zu Ende geht?" },
    { speaker: "Elias", text: "Ja. Ich habe darauf keine fertige Antwort. Vielleicht muss man auch nicht sofort eine haben." },
    { speaker: "Felice", text: "Es tut gut, solche Fragen einfach aussprechen zu können." },
  ] },
  { id: "shooting", title: "Das Schießen", icon: "◎", lines: [
    { speaker: "Felice", text: "Lass uns noch ein bisschen über das Schießen reden." },
    { speaker: "Elias", text: "Über die Konzentration? Diesen Moment, in dem man ganz ruhig wird?" },
    { speaker: "Felice", text: "Ja. Ich würde gern hören, wie du darüber denkst." },
  ] },
  { id: "collin", title: "Collin", icon: "…", lines: [
    { speaker: "Felice", text: "Wollen wir über Collin schreiben?" },
    { speaker: "Elias", text: "Ja. Was möchtest du dazu sagen? Ich höre dir zu." },
    { speaker: "Erzählung", text: "Collin gehörte zu ihren Gesprächsthemen. Was genau sie besprachen, bleibt hier offen." },
  ] },
];
const LATER_CONVERSATIONS: Record<string, [StoryLine[], StoryLine[]]> = {
  computers: [[
    { speaker: "Felice", text: "Mit dir über Computer zu schreiben ist irgendwie schön. Man kommt von einer Frage zur nächsten." },
    { speaker: "Elias", text: "Ja. Man muss nicht schon alles wissen, um sich darüber auszutauschen." },
    { speaker: "Felice", text: "Dann bleiben wir einfach noch ein bisschen bei unseren Fragen." },
  ], [
    { speaker: "Felice", text: "Wir können beim Programmieren anfangen und landen dann wieder irgendwo ganz anders." },
    { speaker: "Elias", text: "Das mag ich an unseren Gesprächen. Wir müssen keinen festen Plan haben." },
    { speaker: "Felice", text: "Ich mag vor allem, dass du auf der anderen Seite bist." },
  ]],
  space: [[
    { speaker: "Felice", text: "Bei all den Fragen über das Weltall könnte so ein Abend ewig weitergehen." },
    { speaker: "Elias", text: "Eine Antwort führt meistens zu noch mehr Fragen. Wir können uns Zeit lassen." },
    { speaker: "Felice", text: "Dann denken wir eben gemeinsam weiter." },
  ], [
    { speaker: "Felice", text: "Das Weltall ist riesig. Und gerade ist es einfach schön, hier mit dir zu schreiben." },
    { speaker: "Elias", text: "Vielleicht muss nicht jeder Gedanke bis zum Ende erklärt werden." },
    { speaker: "Felice", text: "Manche kann man auch einfach miteinander teilen." },
  ]],
  philosophy: [[
    { speaker: "Felice", text: "Über den Tod nachzudenken ist manchmal schwer. Trotzdem möchte ich solche Gedanken nicht immer wegschieben." },
    { speaker: "Elias", text: "Wir können darüber reden, ohne eine endgültige Antwort finden zu müssen." },
    { speaker: "Felice", text: "Danke, dass du dir dafür Zeit nimmst." },
  ], [
    { speaker: "Felice", text: "Auch die schweren Fragen fühlen sich beim Schreiben mit dir ein bisschen weniger allein an." },
    { speaker: "Elias", text: "Ich möchte dir zuhören. Auch wenn ich nicht auf alles eine Antwort habe." },
    { speaker: "Felice", text: "Das reicht gerade schon." },
  ]],
  shooting: [[
    { speaker: "Felice", text: "Was beschäftigt dich beim Gedanken ans Schießen am meisten?" },
    { speaker: "Elias", text: "Dieses Zusammenspiel aus Ruhe und Konzentration. Wie siehst du das?" },
    { speaker: "Felice", text: "Lass uns noch ein bisschen darüber schreiben." },
  ], [
    { speaker: "Felice", text: "Vom Schießen zu den großen Fragen und wieder zurück. Unsere Abende haben viele Themen." },
    { speaker: "Elias", text: "Ja. Und zwischen all den Themen ist immer noch Platz für deine Gedanken." },
    { speaker: "Felice", text: "Für deine auch." },
  ]],
};
export function chatTopicForEvent(id: string, event: StoryEvent): ChatTopic | undefined {
  const topic = CHAT_TOPICS.find(topic => topic.id === id);
  if (!topic) return undefined;
  const stage = event.date && event.date >= "2025-11-22" ? 1 : event.date && event.date >= "2025-11-17" ? 0 : -1;
  if ((stage === 0 || stage === 1) && LATER_CONVERSATIONS[id]) return { ...topic, lines: LATER_CONVERSATIONS[id][stage] };
  return topic;
}
const chatId = (day: number) => `chat-2025-11-${day}`;
const chatEvents: StoryEvent[] = Array.from({ length: 12 }, (_, index) => {
  const day = index + 13;
  return {
    id: chatId(day), title: `Unsere Gespräche · Abend ${index + 1}`, date: `2025-11-${day}`, order: 1,
    place: "bedroom", scene: "chat", requires: day === 13 ? [] : day === 19 ? ["radegast-chocolate"] : [chatId(day - 1)], confirmed: true,
    description: "Zwischen ungefähr 17 und 23 Uhr schreiben wir miteinander. Computer, das Weltall, große Fragen, das Schießen und Collin – aus vielen Abenden wird ein gemeinsamer Anfang.",
    illustration: "/rooms/felice-bedroom-v9.png", staging: { start: 1020, end: 1380, spawn: { x: .5, y: .6 }, timeConfirmed: false },
    dialogue: [{ speaker: "Erzählung", text: index < 4 ? "Ein Handy leuchtet. Es ist noch vieles neu, aber die Gespräche werden länger." : index < 7 ? "Aus einzelnen Nachrichten werden vertraute gemeinsame Abende." : "Zwischen den Zeilen wächst Nähe. Ihr nehmt euch Zeit füreinander." }],
    interactions: ["Am Bett oder Schreibtisch Platz nehmen", "Handy öffnen", "Mindestens zwei Gesprächsthemen auswählen", "Abend bewahren"],
  };
});

export const STORY_EVENTS: StoryEvent[] = ([
  ...chatEvents,
  {
    id: "radegast-chocolate", title: "Schokolade und ein bisschen Unsicherheit", date: "2025-11-19", order: 0,
    place: "radegast", scene: "encounter", requires: [chatId(18)], confirmed: true,
    description: "Elias kam extra mit dem Fahrrad aus Zörbig nach Radegast und brachte mir Schokolade mit. Ich habe sie nicht gegessen. Für ihn war dieser Moment etwas unangenehm – aber er wurde trotzdem Teil unserer Geschichte.",
    illustration: "pasture", staging: { start: 960, end: 990, spawn: { x: .49, y: .49 }, timeConfirmed: false },
    dialogue: [
      { speaker: "Erzählung", text: "Felice ist bei den Pferden in Radegast. Elias kommt mit dem Fahrrad aus Zörbig, um sie zu besuchen." },
      { speaker: "Erzählung", text: "Ihr beginnt ein Gespräch. Für einen Moment stehen das Fahrrad und die Pferde einfach mit dabei. Der genaue Wortlaut ist nicht überliefert." },
      { speaker: "Erzählung", text: "Elias hat Schokolade für Felice mitgebracht. Er hält sie ihr hin." },
      { speaker: "Erzählung", text: "Felice nimmt die Schokolade an, isst sie aber nicht. Weshalb, wird hier nicht ergänzt." },
      { speaker: "Erzählung", text: "Elias fühlt sich dadurch etwas blöd und verunsichert. Ein kleiner, unbeholfener Moment – ohne große Szene." },
    ], interactions: ["Fahrradankunft", "Zu Elias laufen", "Gespräch beginnen", "Schokolade annehmen", "Schokolade nicht essen", "Moment bewahren"],
  },
  {
    id: "first-i-love-you", title: "Unser erstes Ich liebe dich", date: "2025-11-25", order: 0,
    place: "bedroom", scene: "love", requires: [chatId(24)], confirmed: true, special: true,
    description: "Am 25. November schreibt Elias mir zum ersten Mal „Ich liebe dich“. Danach schreibe auch ich ihm „Ich liebe dich“. Zwei Nachrichten, die bleiben.",
    illustration: "/rooms/felice-bedroom-v9.png", staging: { start: 1200, end: 1210, spawn: { x: .5, y: .6 }, timeConfirmed: false },
    dialogue: [{ speaker: "Elias", text: "Ich liebe dich." }, { speaker: "Felice", text: "Ich liebe dich." }],
    interactions: ["Platz nehmen", "Nachricht öffnen", "Nach einem Moment antworten", "Erinnerung bewahren"],
  },
  // Fill date, staging, requires and confirmed only with verified information.
  // Existing chapter mechanics remain playable as clearly labeled undated drafts.
  ...CHAPTERS.map((chapter, index): StoryEvent => ({
    id: `legacy-${chapter.id}`, title: chapter.title, date: null, period: chapter.id === "graduation" ? chapter.date : undefined, order: index, place: chapter.steps[0].place,
    scene: "legacy", requires: [], confirmed: false, chapter: chapter.id,
    description: "Diese Geschichte gehört zu eurer Welt. Das historische Datum und der genaue Ablauf werden später mit bestätigten Angaben ergänzt. Der vorhandene Szenenentwurf bleibt spielbar.",
    illustration: chapter.id === "dog" ? "/rooms/garden-v06.png" : chapter.id === "christmas" ? "/rooms/home-winter-v06.png" : chapter.id === "school" ? "/rooms/zoerbig-market-v08.png" : chapter.id === "graduation" ? "/rooms/graduation-gym-v08.png" : "/rooms/goelzau-range-v1.png",
    staging: { start: 840, end: 900, spawn: { x: .5, y: .7 }, timeConfirmed: false },
    dialogue: chapter.steps.map(step => ({ speaker: "Erzählung", text: step.text })), interactions: chapter.steps.map(step => step.label),
  })),
] satisfies StoryEvent[]).sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999") || a.order - b.order);

export type EventProgress = { cursor: number; topics: string[]; topic: string | null; line: number; visits: number; completedAt?: string };
export type StorySession = { id: string; returnPlayer: Point; returnDirection: "front" | "back" | "left" | "right" };
export type TimelineSave = { version: 1; clock: DaySave; progress: Record<string, EventProgress>; active: StorySession | null };
export const emptyEvent = (): EventProgress => ({ cursor: 0, topics: [], topic: null, line: 0, visits: 0 });
export function historicalDate(date: string | null) { return date ? date.split("-").reverse().join(".") : "Historisches Datum noch offen"; }
export function eventById(id: string) { return STORY_EVENTS.find(event => event.id === id); }
export function initialTimeline(legacyDay?: DaySave, legacyStory?: StorySave, shootingCompleted = false): TimelineSave {
  const clock = legacyDay ? boundClock(legacyDay) : { ...initialDay(new Date(`${STORY_START}T12:00:00Z`)), date: STORY_START, season: "Herbst" as const };
  const progress: Record<string, EventProgress> = {};
  for (const id of legacyStory?.completed ?? []) progress[`legacy-${id}`] = { ...emptyEvent(), visits: 1, completedAt: "legacy" };
  if (shootingCompleted && !progress["legacy-shooting"]) progress["legacy-shooting"] = { ...emptyEvent(), visits: 1, completedAt: "legacy" };
  return { version: 1, clock, progress, active: null };
}
export function boundClock(clock: DaySave): DaySave {
  if (clock.date < STORY_START) return { ...clock, date: STORY_START, day: 1, minute: 300 };
  if (clock.date > STORY_END) {
    const overflowDays = Math.round((Date.parse(`${clock.date}T12:00Z`) - Date.parse(`${STORY_END}T12:00Z`)) / 86400000);
    return { ...clock, date: STORY_END, day: Math.max(1, clock.day - overflowDays), minute: 1439 };
  }
  return clock;
}
export function advanceTimelineClock(clock: DaySave, minutes: number) {
  const result = advanceClock(clock, minutes);
  return { save: boundClock(result.save), notices: result.notices.filter(notice => notice.date < STORY_END || notice.date === STORY_END && notice.minute < 1440) };
}
export function sleepTimelineClock(clock: DaySave) { return clock.date === STORY_END && clock.minute >= 300 ? clock : boundClock(sleepUntilMorning(clock)); }
export function eventStatus(save: TimelineSave, event: StoryEvent): "gesperrt" | "verfügbar" | "abgeschlossen" {
  if (save.progress[event.id]?.completedAt) return "abgeschlossen";
  if (!event.confirmed || !event.date || event.date < STORY_START || event.date > STORY_END) return "gesperrt";
  if (!event.requires.every(id => Boolean(save.progress[id]?.completedAt))) return "gesperrt";
  return save.clock.date > event.date || save.clock.date === event.date && save.clock.minute >= event.staging.start ? "verfügbar" : "gesperrt";
}
export function nextEvent(save: TimelineSave) {
  return STORY_EVENTS.find(event => event.confirmed && event.date && !save.progress[event.id]?.completedAt);
}
export function jumpToNext(save: TimelineSave): TimelineSave {
  const next = nextEvent(save);
  if (!next?.date || save.active) return save;
  return { ...save, clock: clockAtLeast(save.clock, next.date, next.staging.start) };
}
export function clockAtLeast(clock: DaySave, date: string, minute: number): DaySave {
  if (clock.date > date || clock.date === date && clock.minute >= minute) return clock;
  const days = Math.round((Date.parse(`${date}T12:00Z`) - Date.parse(`${clock.date}T12:00Z`)) / 86400000);
  return boundClock({ ...clock, date, minute, day: clock.day + days });
}
export function beginEvent(save: TimelineSave, id: string, player: Point, direction: StorySession["returnDirection"]): TimelineSave {
  const event = eventById(id);
  if (!event || event.scene === "legacy" || save.active || eventStatus(save, event) !== "verfügbar") return save;
  return { ...save, active: { id, returnPlayer: player, returnDirection: direction }, progress: { ...save.progress, [id]: save.progress[id] ?? emptyEvent() } };
}
export function completeEvent(save: TimelineSave, id: string, replay = false, now = new Date().toISOString()): TimelineSave {
  const event = eventById(id);
  if (!event || (!replay && save.active?.id !== id) || (replay && !save.progress[id]?.completedAt)) return save;
  const prior = save.progress[id] ?? emptyEvent();
  if (!replay && (event.scene === "chat" && (new Set(prior.topics).size < 2 || prior.topic !== null) || event.scene === "love" && prior.cursor < 2 || event.scene === "encounter" && prior.cursor < 4)) return save;
  return {
    ...save, active: replay ? save.active : null,
    clock: replay || !event.date ? save.clock : clockAtLeast(save.clock, event.date, event.staging.end),
    progress: { ...save.progress, [id]: { ...prior, topic: null, line: 0, completedAt: prior.completedAt ?? now, visits: prior.visits + 1 } },
  };
}
// A strict versioned boundary prevents corrupt or newer saves being overwritten.
// Unknown event IDs are retained for future additions and removed configurations.
export function parseTimeline(raw: string): TimelineSave {
  const value = JSON.parse(raw);
  if (value?.version !== 1 || !value.clock || typeof value.clock !== "object" || !value.progress || typeof value.progress !== "object" || Array.isArray(value.progress)) throw new Error("Unbekannter Story-Kalender");
  const clock = parseDay(JSON.stringify(value.clock));
  if (clock.date < STORY_START || clock.date > STORY_END) throw new Error("Kalender außerhalb der Geschichte");
  const progress: Record<string, EventProgress> = {};
  for (const [id, state] of Object.entries(value.progress) as [string, EventProgress][]) {
    if (!/^[a-z0-9-]+$/.test(id) || !state || !Number.isInteger(state.cursor) || state.cursor < 0 || state.cursor > 6 || !Number.isInteger(state.line) || state.line < 0 || state.line > 3 || !Number.isInteger(state.visits) || state.visits < 0 || !Array.isArray(state.topics) || !state.topics.every(topic => CHAT_TOPICS.some(t => t.id === topic)) || state.topic !== null && !CHAT_TOPICS.some(t => t.id === state.topic) || state.completedAt !== undefined && (typeof state.completedAt !== "string" || state.completedAt !== "legacy" && !Number.isFinite(Date.parse(state.completedAt)))) throw new Error("Beschädigter Story-Fortschritt");
    progress[id] = { ...state, topics: [...new Set(state.topics)] };
  }
  const active = value.active;
  if (active !== null && (!active || !eventById(active.id) || eventById(active.id)?.scene === "legacy" || !progress[active.id] || progress[active.id].completedAt || !["front","back","left","right"].includes(active.returnDirection) || !Number.isFinite(active.returnPlayer?.x) || !Number.isFinite(active.returnPlayer?.y) || active.returnPlayer.x < 0 || active.returnPlayer.x > 1 || active.returnPlayer.y < 0 || active.returnPlayer.y > 1)) throw new Error("Beschädigte aktive Erinnerung");
  return { version: 1, clock, progress, active };
}
