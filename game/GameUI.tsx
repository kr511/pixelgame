"use client";

import { PointerEvent, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useInput } from "./input";

export function GameUI({ started, onStart }: { started: boolean; onStart: () => void }) {
  const paused = useInput((state) => state.paused);
  const setPaused = useInput((state) => state.setPaused);
  const setMove = useInput((state) => state.setMove);
  const stickOrigin = useRef({ x: 0, y: 0 });
  const [stick, setStick] = useState({ x: 0, y: 0 });

  function moveStick(event: PointerEvent<HTMLDivElement>) {
    const dx = event.clientX - stickOrigin.current.x;
    const dy = event.clientY - stickOrigin.current.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const limit = 34;
    const scale = Math.min(1, limit / length);
    const x = dx * scale; const y = dy * scale;
    setStick({ x, y }); setMove(x / limit, -y / limit);
  }

  function stopStick() { setStick({ x: 0, y: 0 }); setMove(0, 0); }

  return (
    <div className="game-ui">
      <div className="world-title"><span>F × E</span><div><strong>Felice × Elias</strong><small>v0.1 · Abendinsel</small></div></div>
      {started && <button data-game-control className="pause-button" onClick={() => setPaused(!paused)} aria-label={paused ? "Weiterspielen" : "Pause"}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>}
      {started && !paused && <div className="controls-hint"><span className="desktop-hint">WASD · Ziehen zum Umschauen</span><span className="mobile-hint">Links bewegen · Rechts umschauen</span></div>}
      {started && !paused && (
        <div data-game-control className="joystick" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); stickOrigin.current = { x: event.clientX, y: event.clientY }; moveStick(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveStick(event); }} onPointerUp={stopStick} onPointerCancel={stopStick}>
          <div className="joystick-knob" style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }} />
        </div>
      )}
      {(!started || paused) && (
        <div className="start-screen" data-game-control>
          <div className="start-card">
            <p>Eine kleine Welt für uns</p>
            <h1>{paused ? "Kurze Pause?" : "Felice × Elias"}</h1>
            <span>{paused ? "Die Abendinsel wartet auf dich." : "Der erste Schritt in unsere gemeinsame Welt."}</span>
            <button onClick={() => { setPaused(false); onStart(); }}><Play size={17} fill="currentColor" />{paused ? "Weiter" : "Welt betreten"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
