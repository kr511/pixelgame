import type { ChapterId, Place, Point } from "./story";

export type SceneGraphic = { background: string; winter?: string; outdoors: boolean; light: string; foreground: { clip: string; depth: number }[] };
// Each foreground copies only the specified furniture/tree silhouette from the same scene.
const rect = (left: number, top: number, right: number, bottom: number, depth = bottom) => ({ clip: `polygon(${left}% ${top}%,${right}% ${top}%,${right}% ${bottom}%,${left}% ${bottom}%)`, depth });
export const SCENE_GRAPHICS: Record<Place, SceneGraphic> = {
  bedroom: { background: "/rooms/felice-bedroom-v9.png", outdoors: false, light: "#ffbd65", foreground: [rect(12,8.5,49.5,43),rect(49,14,74.5,30),rect(11,43,21.5,59.5),rect(84,33,95,58.5),rect(53,81,96,100,98)] },
  home: { background: "/rooms/home-v06.png", winter: "/rooms/home-winter-v06.png", outdoors: false, light: "#ffd49a", foreground: [rect(46,23.5,73,48),rect(12,17,40,43),rect(84,12,96,46)] },
  kitchen: { background: "/rooms/kitchen-v065.png", outdoors: false, light: "#ffd49a", foreground: [rect(8.7,9,91.4,28.4),rect(57.6,36,85.4,58.5)] },
  garden: { background: "/rooms/garden-v06.png", winter: "/rooms/garden-winter-v06.png", outdoors: true, light: "#e0eabb", foreground: [rect(27,0,70,19),{ clip: "polygon(3% 9%,13% 6%,25% 10%,33% 20%,29% 28%,22% 30%,21% 38%,14% 38%,13% 30%,5% 27%,2% 20%)", depth:38 },{ clip:"polygon(69% 11%,79% 7%,94% 10%,98% 22%,91% 31%,86% 31%,86% 40%,79% 40%,77% 32%,68% 29%,65% 21%)",depth:40 }] },
  radegast: { background: "/rooms/radegast-walk-v075.png", outdoors: true, light: "#e4dbba", foreground: [
    { clip: "polygon(0% 0%,31% 0%,35% 16%,39% 30%,44% 44%,50% 58%,56% 72%,66% 94%,68% 100%,0% 100%)", depth:96 },
    { clip: "polygon(43.5% 16%,50% 30%,56% 44%,62.5% 58%,69% 72%,80% 94%,83% 100%,100% 100%,100% 0%,39% 0%)", depth:96 },
  ] },
  bus: { background: "/rooms/radegast-stop-v075.png", outdoors: true, light: "#dbe8e5", foreground: [rect(50,26,89.5,40),rect(23.5,30,43.5,43),rect(0,0,100,24.5)] },
  zoerbig: { background: "/rooms/zoerbig-walk-v075.png", outdoors: true, light: "#e9dbb8", foreground: [
    { clip: "polygon(0% 0%,40% 0%,41.4% 28%,40% 35%,34% 39%,31.5% 47%,31% 55%,32% 60%,25% 67%,14% 73%,0% 73%)", depth:82 },
    { clip: "polygon(68% 0%,100% 0%,100% 100%,18% 100%,18% 80%,31% 71%,38% 65%,40% 61%,37% 54%,37% 46%,39% 42%,43% 38%,47% 33%,67% 31%)", depth:96 },
    rect(52.5,15,55.5,21),
  ] },
  school: { background: "/rooms/school-court-photo-v075.png", outdoors: true, light: "#e9dbb8", foreground: [
    { clip: "polygon(0% 0%,58.2% 0%,56.7% 30%,17.4% 49.6%,0% 52.6%)", depth:30 },
    { clip: "polygon(0% 18%,14% 19%,17.4% 49.6%,9% 53%,0% 53%)", depth:53 },
    { clip: "polygon(91.7% 0%,100% 0%,100% 100%,96% 100%,90% 72%,88% 49%)", depth:96 },
    { clip: "polygon(38% 16%,48% 12%,55% 17%,54% 29%,48% 31%,47% 37%,50.5% 35.2%,50% 38.2%,45% 39.5%,39.8% 38%,44% 34%,44% 29%,37% 26%)", depth:39.5 },
    { clip: "polygon(49% 7%,58% 5%,64% 10%,66% 19%,59% 23%,59% 24%,62% 24.9%,60.8% 26.8%,56% 26.5%,55% 24.7%,57% 23%,57% 21%,50% 19%)", depth:26.8 },
    { clip: "polygon(80% 8%,86% 8%,92% 13%,91% 21%,87% 23%,88% 24.2%,87% 26.2%,84% 25.5%,83.7% 23.7%,85% 23%,81% 21%,79% 15%)", depth:26.2 },
    { clip: "polygon(72% 24%,78% 22%,85% 25%,84% 31%,80% 32%,83.4% 33.4%,83.1% 36.1%,78% 36.5%,75.4% 34.2%,77% 32%,73% 31%)", depth:36.5 },
    { clip: "polygon(66% 29%,73% 25%,80% 28%,82% 35%,77% 37%,75% 40%,80.7% 38.9%,82.6% 42.7%,76.1% 44.7%,70% 43.1%,70.7% 41.1%,74% 39%,73% 37%,67% 36%)", depth:44.7 },
    { clip: "polygon(65% 35%,72% 33%,78% 36%,79% 43%,75% 46%,74% 49%,78.3% 48.2%,79.5% 50.5%,73.8% 51.8%,68.4% 50.5%,69% 49%,72% 47%,72% 45%,66% 44%)", depth:51.8 },
    { clip: "polygon(57% 42%,64% 36%,70% 36%,75% 39%,78% 46%,74% 52%,68% 52%,69% 54%,73.2% 53.4%,76.9% 58.1%,66.4% 61%,59.5% 57.8%,59% 55%,65% 52%,65% 49%,58% 49%)", depth:61 },
    { clip: "polygon(11.5% 57.7%,26.3% 61.8%,26.2% 63.6%,12.5% 59.9%)", depth:63.6 },
    { clip: "polygon(26.5% 61.8%,26% 66.7%,20.5% 70.4%,29.2% 75.7%,29.2% 88.1%,25.1% 88.1%,25.1% 78.2%,17.8% 71.1%,17.5% 69.5%,22% 65.6%)", depth:88.1 },
    // The diagonal sitting wall needs separate depths so its near end does
    // not cover a person sitting on the far end.
    { clip: "polygon(41.6% 70.4%,43.7% 69.6%,46% 72.7%,43.8% 74.3%,41.4% 72.7%)", depth:72 },
    { clip: "polygon(43.8% 74.3%,46% 72.7%,47.5% 74.6%,45.7% 76.6%,44.3% 76.3%)", depth:75 },
    { clip: "polygon(45.7% 76.6%,47.5% 74.6%,49% 75.3%,46.8% 79%,44.3% 78.5%,44.3% 76.3%)", depth:78 },
  ] },
  goelzau: { background: "/rooms/goelzau-walk-v075.png", outdoors: true, light: "#dfe5ba", foreground: [rect(5,0,63,24.5),rect(71,0,100,43),
    { clip: "polygon(0% 40%,20% 42%,35% 43%,52% 45%,66% 49%,72% 55%,79% 63%,83% 73%,0% 100%)", depth:96 },
  ] },
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
export const POSE_ATLASES = {
  "/characters/neighbors-poses-v065.png": { size: [1254,1254], frames: [
    [[127,10,149,303],[417,4,145,309],[688,11,178,303],[998,6,135,307]],
    [[125,324,148,301],[418,318,138,307],[714,325,126,300],[997,319,138,305]],
    [[115,632,168,282],[401,629,170,285],[676,629,198,285],[986,629,169,285]],
    [[109,940,171,290],[395,940,175,291],[688,940,175,291],[989,940,166,291]],
  ] },
  "/characters/neighbors-walk-v065.png": { size: [1254,1254], frames: [
    [[132,12,149,300],[411,6,148,306],[691,9,179,303],[998,7,146,305]],
    [[134,324,145,296],[415,320,144,300],[714,322,140,298],[1003,319,141,302]],
    [[127,636,151,298],[409,632,142,302],[682,637,189,296],[995,633,146,301]],
    [[129,949,148,294],[409,944,142,300],[709,945,135,297],[1000,940,144,304]],
  ] },
  "/characters/rest-poses-v065.png": { size: [1254,1254], frames: [
    [[181,48,281,539],[798,38,253,549]],
    [[143,627,369,572],[806,627,237,571]],
  ] },
} as const;
export const REST_GRAPHICS = {
  sheet: "/characters/rest-poses-v065.png", size: [1254,1254] as const,
  feliceSeated: POSE_ATLASES["/characters/rest-poses-v065.png"].frames[0][0],
  eliasSeated: POSE_ATLASES["/characters/rest-poses-v065.png"].frames[0][1],
  feliceLying: POSE_ATLASES["/characters/rest-poses-v065.png"].frames[1][0],
  eliasLying: POSE_ATLASES["/characters/rest-poses-v065.png"].frames[1][1],
};
export function characterGraphic(id: string): CharacterGraphic { return CHARACTER_GRAPHICS[id as CharacterId] ?? CHARACTER_GRAPHICS.friend; }
export function speakerGraphic(speaker: string): CharacterId | null {
  const speakers: Record<string, CharacterId> = { Felice: "felice", Elias: "elias", Anuk: "dog", "Felices Mutter": "mother", "Felices Stiefvater": "stepfather", "Felices Halbschwester": "halfsister", "Freund der Halbschwester": "partner-one", "Tochter des Stiefvaters": "stepsister", "Ihr Freund": "partner-two", Freunde: "friend", "Am Schießstand": "host" };
  const friends: Record<string, CharacterId> = { Elena: "elena", Jason: "jason", Luca: "luca", Wyatt: "wyatt", Ida: "ida", Helena: "helena", Linda: "linda", Lina: "lina", Alexandra: "alexandra" };
  return speaker === "Felice & Elias" ? "elias" : speakers[speaker] ?? friends[speaker] ?? null;
}
export const CHAPTER_GRAPHICS: Record<ChapterId, string> = { dog: "/rooms/garden-v06.png", christmas: "/rooms/home-winter-v06.png", school: "/rooms/zoerbig-walk-v075.png", shooting: "/rooms/goelzau-range-v1.png" };
