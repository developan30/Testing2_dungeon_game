import { useRef } from 'react';
import { MathUtils, Vector3 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGame } from '../game/store';

const desired = new Vector3();
const lookAt = new Vector3();

export function CameraRig() {
  const { camera } = useThree();
  const smoothPos = useRef(new Vector3(0, 8, 10));
  const smoothLook = useRef(new Vector3(0, 1, 0));
  const { player, enemies } = useGame();

  useFrame((_, dt) => {
    const nearby = enemies
      .map((e) => ({ ...e, d: Math.hypot(e.x - player.x, e.z - player.z) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);

    let cx = player.x;
    let cz = player.z;
    if (nearby.length) {
      cx = (player.x + nearby.reduce((acc, e) => acc + e.x, 0)) / (nearby.length + 1);
      cz = (player.z + nearby.reduce((acc, e) => acc + e.z, 0)) / (nearby.length + 1);
    }

    const spread = nearby.length
      ? nearby.reduce((m, e) => Math.max(m, Math.hypot(e.x - cx, e.z - cz)), 0)
      : 0;

    const dist = MathUtils.clamp(9 + spread * 0.8, 9, 13);
    desired.set(cx, 5.5 + spread * 0.2, cz + dist);
    lookAt.set(cx, 1.2, cz - 0.5);

    smoothPos.current.lerp(desired, 1 - Math.exp(-dt * 6));
    smoothLook.current.lerp(lookAt, 1 - Math.exp(-dt * 8));
    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);
  });

  return null;
}
