"use client";

import { RefObject, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RapierRigidBody, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { pressedKeys, useInput } from "./input";

export function Player({ bodyRef }: { bodyRef: RefObject<RapierRigidBody | null> }) {
  const visual = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;
    const input = useInput.getState();
    if (input.paused) {
      const velocity = body.linvel();
      body.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
      return;
    }

    const keyboardX = (pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight") ? 1 : 0) - (pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft") ? 1 : 0);
    const keyboardY = (pressedKeys.has("KeyW") || pressedKeys.has("ArrowUp") ? 1 : 0) - (pressedKeys.has("KeyS") || pressedKeys.has("ArrowDown") ? 1 : 0);
    let x = Math.abs(input.moveX) > 0.05 ? input.moveX : keyboardX;
    let y = Math.abs(input.moveY) > 0.05 ? input.moveY : keyboardY;
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }

    const forward = new THREE.Vector3(Math.sin(input.yaw), 0, Math.cos(input.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const direction = forward.multiplyScalar(y).add(right.multiplyScalar(x));
    const velocity = body.linvel();
    const speed = 4.2;
    body.setLinvel({ x: direction.x * speed, y: velocity.y, z: direction.z * speed }, true);

    if (direction.lengthSq() > 0.01) {
      targetRotation.current = Math.atan2(direction.x, direction.z);
      if (visual.current) visual.current.rotation.y = THREE.MathUtils.damp(visual.current.rotation.y, targetRotation.current, 12, delta);
    }
  });

  return (
    <RigidBody ref={bodyRef} position={[0, 1.15, 5]} colliders={false} enabledRotations={[false, false, false]} linearDamping={8} friction={1} canSleep={false}>
      <CapsuleCollider args={[0.46, 0.34]} />
      <group ref={visual}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.34, 0.68, 8, 16]} />
          <meshStandardMaterial color="#f8dfcf" roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.29, 18, 14]} />
          <meshStandardMaterial color="#f2c5aa" roughness={0.72} />
        </mesh>
        <mesh castShadow position={[0, 0.72, -0.04]} rotation={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.305, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#472c27" roughness={0.9} />
        </mesh>
      </group>
    </RigidBody>
  );
}
