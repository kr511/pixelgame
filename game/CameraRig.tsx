"use client";

import { RefObject, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useInput } from "./input";

const desired = new THREE.Vector3();
const target = new THREE.Vector3();

export function CameraRig({ bodyRef }: { bodyRef: RefObject<RapierRigidBody | null> }) {
  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const start = (event: PointerEvent) => {
      if ((event.target as HTMLElement)?.closest("[data-game-control]")) return;
      dragging = true; lastX = event.clientX; lastY = event.clientY;
    };
    const move = (event: PointerEvent) => {
      if (!dragging || useInput.getState().paused) return;
      useInput.getState().rotateCamera(event.clientX - lastX, event.clientY - lastY);
      lastX = event.clientX; lastY = event.clientY;
    };
    const stop = () => { dragging = false; };
    window.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => { window.removeEventListener("pointerdown", start); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); };
  }, []);

  useFrame(({ camera }, delta) => {
    const body = bodyRef.current;
    if (!body) return;
    const position = body.translation();
    const { yaw, pitch } = useInput.getState();
    target.set(position.x, position.y + 0.45, position.z);
    const distance = 5.8;
    desired.set(
      position.x - Math.sin(yaw) * Math.cos(pitch) * distance,
      position.y + 1.3 + Math.sin(pitch) * distance,
      position.z - Math.cos(yaw) * Math.cos(pitch) * distance,
    );
    camera.position.lerp(desired, 1 - Math.exp(-7 * delta));
    camera.lookAt(target);
  });
  return null;
}
