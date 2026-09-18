"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import { CameraRig } from "./CameraRig";
import { GameUI } from "./GameUI";
import { pressedKeys, useInput } from "./input";
import { Player } from "./Player";
import { World } from "./World";

type GameTool = { name: string; title: string; description: string; inputSchema: object; annotations: object; execute: (input: unknown) => unknown };
declare global { interface Document { modelContext?: { registerTool: (tool: GameTool, options?: { signal?: AbortSignal }) => void | Promise<void> }; } }

export function Game() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const [started, setStarted] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(matchMedia("(pointer: coarse)").matches);
    const down = (event: KeyboardEvent) => { if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) { event.preventDefault(); pressedKeys.add(event.code); } if (event.code === "Escape" && started) useInput.getState().setPaused(!useInput.getState().paused); };
    const up = (event: KeyboardEvent) => pressedKeys.delete(event.code);
    const blur = () => { pressedKeys.clear(); useInput.getState().setMove(0, 0); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [started]);

  useEffect(() => {
    if (!document.modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(document.modelContext.registerTool({
      name: "set_game_state",
      title: "Spiel steuern",
      description: "Startet oder pausiert die sichtbare 3D-Welt.",
      inputSchema: { type: "object", properties: { action: { type: "string", enum: ["start", "pause", "resume"] } }, required: ["action"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const action = (input as { action?: unknown })?.action;
        if (!['start', 'pause', 'resume'].includes(String(action))) throw new Error("Unbekannte Spielaktion.");
        if (action === "start") setStarted(true);
        useInput.getState().setPaused(action === "pause");
        return { started: action === "start" ? true : started, paused: action === "pause" };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [started]);

  return (
    <main className="game-shell">
      <Canvas shadows={!mobile} dpr={mobile ? [1, 1.25] : [1, 1.75]} camera={{ position: [0, 4.6, 10], fov: mobile ? 58 : 50, near: .1, far: 80 }} gl={{ antialias: !mobile, powerPreference: "high-performance" }}>
        <Suspense fallback={null}>
          <Physics gravity={[0, -18, 0]} timeStep="vary">
            <World />
            <Player bodyRef={bodyRef} />
          </Physics>
          <CameraRig bodyRef={bodyRef} />
          <AdaptiveDpr pixelated />
          <Preload all />
        </Suspense>
      </Canvas>
      <GameUI started={started} onStart={() => setStarted(true)} />
    </main>
  );
}
