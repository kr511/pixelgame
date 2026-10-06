import type { Place, Point } from "./story";

export const DAY_KEY = "felice-elias.day.v061";
export const ACTION_MINUTES = 10;
export const TRAVEL_MINUTES = 30;
export const SCHOOL_START = 7 * 60 + 15;
export const SCHOOL_END = 13 * 60;
export const NOTICE_TIMES = [8, 12, 15, 18, 21, 24].map(hour => hour * 60);
export const SEASONS = ["Frühling", "Sommer", "Herbst", "Winter"] as const;
export type Season = typeof SEASONS[number];
export type DaySave = { version: 1; date: string; minute: number; day: number; season: Season };
export type DayNotice = { date: string; minute: number };
export type RestSpot = { id: string; place: Place; name: string; kind: "bench" | "bed"; approach: Point; position: Point; companion?: Point; furniture?: Point };

export function initialDay(now = new Date()): DaySave {
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const month = now.getMonth();
  const season = month >= 2 && month <= 4 ? "Frühling" : month >= 5 && month <= 7 ? "Sommer" : month >= 8 && month <= 10 ? "Herbst" : "Winter";
  return { version: 1, date, minute: 300, day: 1, season };
}
function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
    && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}
function nextDate(date: string, days: number) {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}
export function parseDay(raw: string | null): DaySave {
  if (!raw) return initialDay();
  const value = JSON.parse(raw);
  if (value?.version !== 1 || !validDate(value.date) || !Number.isInteger(value.minute)
    || value.minute < 0 || value.minute >= 1440 || !Number.isInteger(value.day) || value.day < 1
    || !SEASONS.includes(value.season)) {
    throw new Error("Unbekannter Tagesstand");
  }
  return { version: 1, date: value.date, minute: value.minute, day: value.day, season: value.season };
}
export function advanceClock(save: DaySave, minutes: number): { save: DaySave; notices: DayNotice[] } {
  if (!Number.isInteger(minutes) || minutes < 0) throw new Error("Ungültige Aktionsdauer");
  const total = save.minute + minutes;
  const days = Math.floor(total / 1440);
  const notices: DayNotice[] = [];
  for (let offset = 0; offset <= days; offset++) {
    for (const minute of NOTICE_TIMES) {
      const at = offset * 1440 + minute;
      if (at > save.minute && at <= total) notices.push({ date: nextDate(save.date, offset), minute });
    }
  }
  return { save: { ...save, date: nextDate(save.date, days), day: save.day + days, minute: total % 1440 }, notices };
}
// Sleep deliberately skips every notice until the next morning.
export function sleepUntilMorning(save: DaySave): DaySave {
  const days = save.minute < 300 ? 0 : 1;
  return { ...save, date: nextDate(save.date, days), day: save.day + days, minute: 300 };
}
export function clockText(minute: number) {
  return `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, "0")}`;
}
export function activityAt(place: Place, minute: number) {
  if (place === "bedroom" || place === "home" || place === "garden") return "Zuhause";
  if (place === "range") return "Schießen · Gölzau";
  if (place === "school") return minute >= SCHOOL_START && minute < SCHOOL_END ? "Schule · Unterrichtszeit" : "Schule · Schulhof";
  return "Radegast · Haltestelle";
}

// Soft seasonal dawn/dusk for the atmosphere around Radegast.
const DAYLIGHT: Record<Season, [number, number]> = { Frühling: [360, 1200], Sommer: [285, 1290], Herbst: [420, 1080], Winter: [480, 990] };
export function seasonalLight(season: Season, minute: number) {
  const [dawn, dusk] = DAYLIGHT[season];
  const daylight = Math.max(0, Math.min(1, (minute - dawn + 45) / 90, (dusk + 45 - minute) / 90));
  return { daylight, season };
}

export const REST_SPOTS: RestSpot[] = [
  { id: "felice-bed", place: "bedroom", name: "Felices Bett", kind: "bed", approach: { x: .30, y: .49 }, position: { x: .255, y: .35 } },
  { id: "garden-bench", place: "garden", name: "Gartenbank", kind: "bench", approach: { x: .25, y: .65 }, position: { x: .215, y: .602 }, companion: { x: .28, y: .602 }, furniture: { x: .25, y: .61 } },
  { id: "bus-bench", place: "bus", name: "Bank an der Haltestelle", kind: "bench", approach: { x: .275, y: .405 }, position: { x: .247, y: .36 }, companion: { x: .306, y: .36 } },
  { id: "school-bench", place: "school", name: "Bank auf dem Schulhof", kind: "bench", approach: { x: .205, y: .54 }, position: { x: .175, y: .48 }, companion: { x: .24, y: .48 } },
  { id: "school-bench-right", place: "school", name: "Bank am Schulhofrand", kind: "bench", approach: { x: .8, y: .54 }, position: { x: .765, y: .48 }, companion: { x: .83, y: .48 } },
  { id: "range-bench", place: "range", name: "Bank am Schießstand", kind: "bench", approach: { x: .76, y: .89 }, position: { x: .725, y: .835 }, companion: { x: .79, y: .835 }, furniture: { x: .76, y: .845 } },
];
