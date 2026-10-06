import { memo, useState, type CSSProperties } from "react";
import { SceneArt, PersonArt, DogArt } from "./SceneArt";
import { CHARACTER_GRAPHICS, SCENE_GRAPHICS, characterGraphic, sceneBackground } from "./graphics";
import type { Place } from "./story";

export const WorldBackdrop = memo(function WorldBackdrop({ place, winter }: { place: Place; winter: boolean }) {
  const source = sceneBackground(place, winter);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (failedSource === source) return <div className={`scene-backdrop fallback-${place}`}><SceneArt place={place} christmas={winter}/></div>;
  return <>
    <svg className="scene-backdrop" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><image href={source} width="100" height="100" preserveAspectRatio="none" onError={() => setFailedSource(source)}/></svg>
    {SCENE_GRAPHICS[place].foreground.map((layer, index) => <svg key={index} className="scene-foreground" style={{ clipPath: layer.clip, zIndex: Math.round(layer.depth) + 9 }} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><image href={source} width="100" height="100" preserveAspectRatio="none"/></svg>)}
  </>;
});

export function CharacterArt({ id, portrait = false, direction = "front", walking = false, pose = "standing" }: { id: string; portrait?: boolean; direction?: "front" | "left" | "back" | "right"; walking?: boolean; pose?: "standing" | "sitting" | "lying" }) {
  const graphic = characterGraphic(id);
  const spec = portrait ? graphic.portrait : graphic;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const column = !portrait && (id === "elias" || id === "felice") ? ["front","left","back","right"].indexOf(direction) : spec.column;
  if (failedSource === spec.sheet) return <span className="character-fallback">{id === "dog" ? <DogArt/> : <PersonArt variant={id}/>}</span>;
  if (!portrait && pose === "sitting") return <svg className="character-art character-seated" viewBox="0 0 100 100" aria-hidden="true">
    <svg x="0" y="10" width="100" height="65" viewBox="0 0 100 65" overflow="hidden"><image href={spec.sheet} width={spec.columns*100} height={spec.rows*100} x="0" y="0" preserveAspectRatio="none" onError={() => setFailedSource(spec.sheet)}/></svg>
    <path d="M38 72Q32 71 32 80L35 91H46L48 78H51L54 91H65L68 80Q69 73 62 72Z" fill={id === "elias" ? "#282a2c" : "#363234"} stroke="#242426" strokeWidth="1.5"/>
    <path d="M34 89h13l1 5H31l1-3ZM53 89h13l3 5H53Z" fill="#eee8dd" stroke="#635b55" strokeWidth="1"/>
  </svg>;
  if (!portrait && pose === "lying") return <svg className="character-art character-lying" viewBox="0 0 160 75" aria-hidden="true">
    <rect x="7" y="13" width="34" height="48" rx="9" fill="#f1dcc2" stroke="#c4aa8c" strokeWidth="2"/>
    <g transform="translate(2 73) rotate(-90) scale(.72 1.45)"><svg width="100" height="100" viewBox="0 0 100 100" overflow="hidden"><image href={spec.sheet} width={spec.columns*100} height={spec.rows*100} preserveAspectRatio="none" onError={() => setFailedSource(spec.sheet)}/></svg></g>
    <path d="M54 10Q62 5 68 10H151V64H54Q61 39 54 10Z" fill="#b88874" stroke="#765743" strokeWidth="2"/><path d="M66 14v46M86 10v54M107 10v54M128 10v54M58 28h92M57 45h93" stroke="#e4baa0" strokeWidth="2" opacity=".6"/>
  </svg>;
  // The image moves by whole cells; each SVG's viewport clips exactly one atlas frame.
  const viewBox = portrait && id === "felice" ? "38 0 52 52" : "0 0 100 100";
  return <svg className={`character-art ${walking ? "character-walking" : ""}`} viewBox={viewBox} aria-hidden="true" shapeRendering="geometricPrecision">
    <image className="character-sheet" href={spec.sheet} x={-column*100} y={-spec.row*100} width={spec.columns*100} height={spec.rows*100} preserveAspectRatio="none" onError={() => setFailedSource(spec.sheet)}/>
  </svg>;
}

export function characterStyle(id: string): CSSProperties {
  const graphic = characterGraphic(id);
  return { width: `${graphic.width}%`, transform: `translate(${-graphic.anchor.x*100}%,${-graphic.anchor.y*100}%)` };
}

export const WorldAtmosphere = memo(function WorldAtmosphere({ place, winter }: { place: Place; winter: boolean }) {
  const scene = SCENE_GRAPHICS[place];
  return <div className={`world-atmosphere ${scene.outdoors ? "is-outdoors" : "is-indoors"} ${winter ? "is-winter" : ""}`} aria-hidden="true" style={{ "--scene-light": scene.light } as CSSProperties}>
    {!scene.outdoors && <><span className="lamp-glow lamp-one"/><span className="lamp-glow lamp-two"/></>}
    {scene.outdoors && [0,1,2,3].map(i => <span key={i} className="drifting-leaf" style={{ "--leaf-index": i } as CSSProperties}/>)}
    {winter && (place === "home" || place === "bedroom") && <span className="christmas-lights">{[0,1,2,3,4,5,6,7].map(i=><i key={i} style={{ animationDelay: `${i*.37}s` }}/>)}</span>}
  </div>;
});

// Explicit export for asset consumers and preview tools.
export const ELIAS_SHEET = CHARACTER_GRAPHICS.elias.sheet;
