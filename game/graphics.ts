import type { ChapterId, Place, Point } from "./story";

export type SceneGraphic = { background: string; winter?: string; outdoors: boolean; light: string; foreground: { clip: string; depth: number }[] };
// Each foreground copies only the specified furniture/tree silhouette from the same scene.
const rect = (left: number, top: number, right: number, bottom: number, depth = bottom) => ({ clip: `polygon(${left}% ${top}%,${right}% ${top}%,${right}% ${bottom}%,${left}% ${bottom}%)`, depth });
export const SCENE_GRAPHICS: Record<Place, SceneGraphic> = {
  bedroom: { background: "/rooms/felice-bedroom-v9.png", outdoors: false, light: "#ffbd65", foreground: [rect(12,8.5,49.5,43),rect(49,14,74.5,30),rect(11,43,21.5,59.5),rect(84,33,95,58.5),rect(53,81,96,100,98)] },
  home: { background: "/rooms/home-v06.png", winter: "/rooms/home-winter-v06.png", outdoors: false, light: "#ffd49a", foreground: [rect(46,23.5,73,48),rect(12,17,40,43),rect(84,12,96,46)] },
  garden: { background: "/rooms/garden-v06.png", winter: "/rooms/garden-winter-v06.png", outdoors: true, light: "#e0eabb", foreground: [rect(27,0,70,19),{ clip: "polygon(3% 9%,13% 6%,25% 10%,33% 20%,29% 28%,22% 30%,21% 38%,14% 38%,13% 30%,5% 27%,2% 20%)", depth:38 },{ clip:"polygon(69% 11%,79% 7%,94% 10%,98% 22%,91% 31%,86% 31%,86% 40%,79% 40%,77% 32%,68% 29%,65% 21%)",depth:40 }] },
  bus: { background: "/rooms/bus-v06.png", winter: "/rooms/bus-winter-v06.png", outdoors: true, light: "#dbe8e5", foreground: [rect(61,5,87,36),rect(13,21,42,37)] },
  school: { background: "/rooms/school-v06.png", winter: "/rooms/school-winter-v06.png", outdoors: true, light: "#e9dbb8", foreground: [rect(0,0,100,32),rect(11,38,30,48),rect(70,38,89,48)] },
  range: { background: "/rooms/range-v06.png", outdoors: false, light: "#e3e3ba", foreground: [rect(10,4,90,34)] },
};
export function sceneBackground(place: Place, winter: boolean) { const scene = SCENE_GRAPHICS[place]; return winter && scene.winter ? scene.winter : scene.background; }

export type CharacterGraphic = { sheet: string; columns: number; rows: number; column: number; row: number; width: number; anchor: Point; portrait: { sheet: string; columns: number; rows: number; column: number; row: number } };
const npc = (column: number, row: number): CharacterGraphic => ({ sheet: "/characters/neighbors-v06.png", columns: 4, rows: 2, column, row, width: 7.6, anchor: { x: .5, y: 1 }, portrait: { sheet: "/characters/portraits-v06.png", columns: 4, rows: 2, column, row } });
export const CHARACTER_GRAPHICS = {
  felice: { sheet: "/characters/felice-walk-v1.png", columns: 4, rows: 3, column: 0, row: 0, width: 7.6, anchor: { x: .5, y: 1 }, portrait: { sheet: "/characters/felice-walk-v1.png", columns: 4, rows: 3, column: 0, row: 0 } },
  elias: { sheet: "/characters/elias-walk-v06-fixed.png", columns: 4, rows: 3, column: 0, row: 0, width: 7.8, anchor: { x: .5, y: 1 }, portrait: { sheet: "/characters/elias-portrait-v06.png", columns: 1, rows: 1, column: 0, row: 0 } },
  mother: npc(0,0), stepfather: npc(1,0), halfsister: npc(2,0), "partner-one": npc(3,0), stepsister: npc(0,1), "partner-two": npc(1,1), friend: npc(2,1), host: npc(3,1),
  // Temporary existing atlas frames until personal appearances are supplied.
  elena: npc(2,1), jason: npc(3,0), luca: npc(1,1), wyatt: npc(3,1),
  ida: npc(0,0), helena: npc(2,0), linda: npc(0,1), lina: npc(2,1), alexandra: npc(0,1),
  dog: { sheet: "/characters/anuk-v06.png", columns: 1, rows: 1, column: 0, row: 0, width: 9, anchor: { x: .5, y: .94 }, portrait: { sheet: "/characters/anuk-v06.png", columns: 1, rows: 1, column: 0, row: 0 } },
} satisfies Record<string, CharacterGraphic>;
export type CharacterId = keyof typeof CHARACTER_GRAPHICS;
export type SpriteRect = readonly [number, number, number, number];
// Measured opaque character bounds, excluding neighboring frames and transparent
// margins. Every frame is fitted onto the same center/foot baseline at render time.
export const SPRITE_FRAMES: Record<string, { size: readonly [number, number]; frames: readonly (readonly SpriteRect[])[] }> = {
  "/characters/felice-walk-v1.png": { size: [1448,1086], frames: [
    [[159,19,148,343],[471,19,133,343],[841,19,147,343],[1125,19,132,343]],
    [[161,376,158,334],[435,375,173,334],[833,376,160,334],[1122,376,173,334]],
    [[157,727,151,334],[443,727,165,332],[841,727,153,334],[1122,727,165,332]],
  ] },
  "/characters/elias-walk-v06-fixed.png": { size: [1448,1086], frames: [
    [[153,12,154,350],[469,14,137,348],[825,13,160,349],[1148,14,136,348]],
    [[150,373,167,344],[444,374,193,342],[819,374,170,343],[1115,374,193,342]],
    [[149,724,164,340],[443,724,198,338],[822,724,163,339],[1111,724,199,338]],
  ] },
  "/characters/neighbors-v06.png": { size: [1774,887], frames: [
    [[183,20,194,415],[570,7,184,428],[1012,23,199,414],[1411,10,194,425]],
    [[184,453,190,418],[569,444,180,427],[1012,452,194,419],[1425,444,177,427]],
  ] },
};
export const REST_GRAPHICS = {
  sheet: "/characters/rest-poses-v061.png", size: [1254,1254] as const,
  feliceSeated: [181,48,272,548] as SpriteRect,
  eliasSeated: [795,39,258,557] as SpriteRect,
  feliceLying: [145,660,334,549] as SpriteRect,
};
export function characterGraphic(id: string): CharacterGraphic { return CHARACTER_GRAPHICS[id as CharacterId] ?? CHARACTER_GRAPHICS.friend; }
export function speakerGraphic(speaker: string): CharacterId | null {
  const speakers: Record<string, CharacterId> = { Felice: "felice", Elias: "elias", Anuk: "dog", "Felices Mutter": "mother", "Felices Stiefvater": "stepfather", "Felices Halbschwester": "halfsister", "Freund der Halbschwester": "partner-one", "Tochter des Stiefvaters": "stepsister", "Ihr Freund": "partner-two", Freunde: "friend", "Am Schießstand": "host" };
  const friends: Record<string, CharacterId> = { Elena: "elena", Jason: "jason", Luca: "luca", Wyatt: "wyatt", Ida: "ida", Helena: "helena", Linda: "linda", Lina: "lina", Alexandra: "alexandra" };
  return speaker === "Felice & Elias" ? "elias" : speakers[speaker] ?? friends[speaker] ?? null;
}
export const CHAPTER_GRAPHICS: Record<ChapterId, string> = { dog: "/rooms/garden-v06.png", christmas: "/rooms/home-winter-v06.png", school: "/rooms/bus-v06.png", shooting: "/rooms/goelzau-range-v1.png" };
