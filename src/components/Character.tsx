import { useEffect, useMemo, useRef } from 'react';
import { Group, MathUtils } from 'three';
import { useFrame } from '@react-three/fiber';

type CharacterProps = {
  position: [number, number, number];
  moving: boolean;
  attackTick: number;
  isDead?: boolean;
};

export function Character({ position, moving, attackTick, isDead = false }: CharacterProps) {
  const root = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const sword = useRef<Group>(null);
  const targetYaw = useRef(0);
  const t = useRef(0);
  const attack = useRef(0);
  const prevPos = useRef<[number, number, number]>(position);

  useEffect(() => {
    attack.current = 1;
  }, [attackTick]);

  useFrame((_, dt) => {
    t.current += dt;
    attack.current = Math.max(0, attack.current - dt * 3.5);

    const dx = position[0] - prevPos.current[0];
    const dz = position[2] - prevPos.current[2];
    if (Math.hypot(dx, dz) > 0.001) {
      targetYaw.current = Math.atan2(dx, dz);
    }
    prevPos.current = position;

    if (root.current) {
      root.current.position.set(position[0], position[1], position[2]);
      root.current.rotation.y = MathUtils.lerp(root.current.rotation.y, targetYaw.current, dt * 10);
      root.current.position.y = position[1] + Math.sin(t.current * 2.2) * 0.03;
      if (isDead) root.current.rotation.z = MathUtils.lerp(root.current.rotation.z, -1.3, dt * 4);
    }

    const walk = moving ? Math.sin(t.current * 10) * 0.6 : 0;
    const breathe = Math.sin(t.current * 2) * 0.05;
    const atk = Math.sin((1 - attack.current) * Math.PI) * attack.current;

    if (leftArm.current) leftArm.current.rotation.x = -walk * 0.8 + breathe;
    if (rightArm.current) rightArm.current.rotation.x = walk * 0.8 + atk * -2.2 + breathe;
    if (leftLeg.current) leftLeg.current.rotation.x = walk;
    if (rightLeg.current) rightLeg.current.rotation.x = -walk;
    if (sword.current) sword.current.rotation.z = -0.2 + atk * -0.8;
  });

  const steel = useMemo(() => '#7f9cb8', []);
  const cloth = useMemo(() => '#3b5f8f', []);

  return (
    <group ref={root}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.25, 10, 10]} />
        <meshStandardMaterial color="#cfd9e5" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.75, 0.9, 0.4]} />
        <meshStandardMaterial color={steel} metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.65, 0.35, 0.35]} />
        <meshStandardMaterial color={cloth} />
      </mesh>

      <group ref={leftArm} position={[-0.5, 1.45, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.23, 0.65, 0.23]} />
          <meshStandardMaterial color={steel} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.5, 1.45, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.23, 0.65, 0.23]} />
          <meshStandardMaterial color={steel} />
        </mesh>
        <group ref={sword} position={[0, -0.62, 0.05]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.7, 0.08]} />
            <meshStandardMaterial color="#d7e2ef" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.38, 0]} castShadow>
            <boxGeometry args={[0.2, 0.08, 0.1]} />
            <meshStandardMaterial color="#84643d" />
          </mesh>
        </group>
      </group>

      <group ref={leftLeg} position={[-0.2, 0.45, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.23, 0.7, 0.23]} />
          <meshStandardMaterial color={cloth} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.2, 0.45, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.23, 0.7, 0.23]} />
          <meshStandardMaterial color={cloth} />
        </mesh>
      </group>
    </group>
  );
}
