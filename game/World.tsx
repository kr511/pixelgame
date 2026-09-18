"use client";

import { Float, Sparkles } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

const trees = [
  [-7, -5, 1.15], [-10, 1, 0.9], [-6, 7, 1], [7, -7, 1.1], [10, 2, 0.85], [6, 8, 1.05], [12, -2, 0.7], [-12, -7, 0.75],
] as const;

function Tree({ position, scale }: { position: readonly [number, number, number]; scale: number }) {
  return (
    <group position={[position[0], 0, position[1]]} scale={scale}>
      <mesh castShadow position={[0, 0.85, 0]}><cylinderGeometry args={[0.13, 0.18, 1.7, 7]} /><meshStandardMaterial color="#5c3727" roughness={1} /></mesh>
      <mesh castShadow position={[0, 2.05, 0]}><coneGeometry args={[0.9, 2.2, 8]} /><meshStandardMaterial color="#315b48" roughness={.95} /></mesh>
      <mesh castShadow position={[0, 2.75, 0]}><coneGeometry args={[0.67, 1.65, 8]} /><meshStandardMaterial color="#42715a" roughness={.92} /></mesh>
    </group>
  );
}

export function World() {
  return (
    <>
      <color attach="background" args={["#e88d69"]} />
      <fog attach="fog" args={["#e88d69", 20, 48]} />
      <hemisphereLight args={["#ffd7b5", "#354945", 1.8]} />
      <directionalLight castShadow position={[-9, 14, 8]} intensity={3.2} color="#ffd0a2" shadow-mapSize={[1024, 1024]} shadow-camera-far={45} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} />

      <RigidBody key="island" type="fixed" colliders={false}>
        <CuboidCollider args={[16, .25, 16]} position={[0, -.25, 0]} />
        <mesh receiveShadow position={[0, -.28, 0]}>
          <cylinderGeometry args={[22, 17, 1.2, 28]} />
          <meshStandardMaterial color="#76906a" roughness={1} />
        </mesh>
        <mesh receiveShadow position={[0, -.86, 0]}>
          <cylinderGeometry args={[17, 13, 1.1, 28]} />
          <meshStandardMaterial color="#667069" roughness={1} />
        </mesh>
        <CuboidCollider args={[.3, 2, 16]} position={[-16, 1.5, 0]} />
        <CuboidCollider args={[.3, 2, 16]} position={[16, 1.5, 0]} />
        <CuboidCollider args={[16, 2, .3]} position={[0, 1.5, -16]} />
        <CuboidCollider args={[16, 2, .3]} position={[0, 1.5, 16]} />
      </RigidBody>

      {trees.map(([x, z, scale]) => <Tree key={`${x}-${z}`} position={[x, z, scale]} scale={scale} />)}

      <RigidBody key="crate" type="fixed" colliders="cuboid" position={[4.8, .45, -2.5]}>
        <mesh castShadow receiveShadow><boxGeometry args={[2.6, .9, 2.2]} /><meshStandardMaterial color="#a9644e" roughness={.9} /></mesh>
      </RigidBody>
      <RigidBody key="rock" type="fixed" colliders="ball" position={[-3.8, .58, -3.4]}>
        <mesh castShadow receiveShadow scale={[1.35, .78, 1]}><dodecahedronGeometry args={[.8, 0]} /><meshStandardMaterial color="#68736f" roughness={1} /></mesh>
      </RigidBody>

      <Float speed={1.2} rotationIntensity={.08} floatIntensity={.22}>
        <mesh position={[0, 1.25, -8]} castShadow>
          <octahedronGeometry args={[.45, 0]} />
          <meshStandardMaterial color="#ffd49a" emissive="#ff9f65" emissiveIntensity={1.8} roughness={.35} />
        </mesh>
      </Float>
      <Sparkles count={34} scale={[20, 5, 20]} position={[0, 2, 0]} size={1.7} speed={.18} color="#ffe0b4" opacity={.55} />
    </>
  );
}
