import { memo, useId, useState, type CSSProperties } from "react";
import { SceneArt, PersonArt, DogArt } from "./SceneArt";
import { CHARACTER_GRAPHICS, REST_GRAPHICS, SPRITE_FRAMES, SCENE_GRAPHICS, characterGraphic, sceneBackground } from "./graphics";
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

export function CharacterArt({ id, portrait = false, direction = "front", walking = false, frame = 0, pose = "standing" }: { id: string; portrait?: boolean; direction?: "front" | "left" | "back" | "right"; walking?: boolean; frame?: number; pose?: "standing" | "sitting" | "lying" }) {
  const graphic = characterGraphic(id);
  const spec = portrait ? graphic.portrait : graphic;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const column = !portrait && (id === "elias" || id === "felice") ? ["front","left","back","right"].indexOf(direction) : spec.column;
  const resting = !portrait && pose !== "standing" && (id === "felice" || id === "elias");
  const sheet = resting ? REST_GRAPHICS.sheet : spec.sheet;
  if (failedSource === sheet) return <span className={`character-fallback fallback-pose-${pose}`}>{id === "dog" ? <DogArt/> : <PersonArt variant={id}/>}</span>;
  const atlas = SPRITE_FRAMES[spec.sheet];
  if (!portrait && (atlas || resting)) {
    const rect = resting ? pose === "lying" ? REST_GRAPHICS.feliceLying : id === "elias" ? REST_GRAPHICS.eliasSeated : REST_GRAPHICS.feliceSeated : atlas.frames[walking ? frame : spec.row][column];
    const size = resting ? REST_GRAPHICS.size : atlas.size;
    const height = pose === "sitting" ? 120 : 132;
    const width = rect[2] / rect[3] * height;
    return <svg key={sheet} className={`character-art character-${pose}`} viewBox="0 0 100 140" data-frame={walking ? frame : 0} aria-hidden="true">
      <svg x={50-width/2} y={140-height} width={width} height={height} viewBox={rect.join(" ")} overflow="hidden">
        <image href={sheet} width={size[0]} height={size[1]} onError={() => setFailedSource(sheet)}/>
      </svg>
    </svg>;
  }
  if (portrait && id === "felice") return <svg className="character-art" viewBox="155 15 155 155" aria-hidden="true"><image href={spec.sheet} width="1448" height="1086" onError={() => setFailedSource(sheet)}/></svg>;
  return <svg className="character-art" viewBox="0 0 100 100" aria-hidden="true">
    <image href={spec.sheet} x={-column*100} y={-spec.row*100} width={spec.columns*100} height={spec.rows*100} preserveAspectRatio="none" onError={() => setFailedSource(sheet)}/>
  </svg>;
}

/** Reuse the painted bench silhouette; the paving is excluded by the mask. */
export function BenchArt({ winter = false }: { winter?: boolean }) {
  const clip = useId();
  return <svg viewBox="10.8 37.8 19 10.4" aria-hidden="true">
    <defs><clipPath id={clip}><path d="M11.5 38.5H29.2V45.5H11.5ZM11.1 39H12.1V47.8H11.1ZM28.4 39H29.6V47.8H28.4Z"/></clipPath></defs>
    <image href={sceneBackground("school", winter)} width="100" height="100" clipPath={`url(#${clip})`}/>
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
