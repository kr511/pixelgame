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

export function CharacterArt({ id, portrait = false, direction = "front", walking = false }: { id: string; portrait?: boolean; direction?: "front" | "left" | "back" | "right"; walking?: boolean }) {
  const graphic = characterGraphic(id);
  const spec = portrait ? graphic.portrait : graphic;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const column = !portrait && (id === "elias" || id === "felice") ? ["front","left","back","right"].indexOf(direction) : spec.column;
  if (failedSource === spec.sheet) return <span className="character-fallback">{id === "dog" ? <DogArt/> : <PersonArt variant={id}/>}</span>;
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
