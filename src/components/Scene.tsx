import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Character } from './Character';
import { EnemyCharacter } from './EnemyCharacter';
import { useGame } from '../game/store';

export function Scene() {
  const { player, enemies, tick, setKey, attack, restart, gameOver, attackTick, keys } = useGame();

  useEffect(() => {
    restart();
    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(k)) setKey(k, true);
      if (k === ' ') attack();
    };
    const ku = (e: KeyboardEvent) => setKey(e.key.toLowerCase(), false);
    const md = () => attack();
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('mousedown', md);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('mousedown', md);
    };
  }, [attack, restart, setKey]);

  useFrame((_, dt) => tick(Math.min(dt, 0.033)));

  const isMoving = Boolean(keys.w || keys.a || keys.s || keys.d);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2d2d33" roughness={1} />
      </mesh>

      {[
        [0, 2, -10],
        [0, 2, 10],
        [-10, 2, 0],
        [10, 2, 0],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation-y={i > 1 ? Math.PI / 2 : 0}>
          <boxGeometry args={[20, 4, 0.5]} />
          <meshStandardMaterial color="#4a4a50" />
        </mesh>
      ))}

      <Character
        position={[player.x, 0, player.z]}
        moving={isMoving && !gameOver}
        attackTick={attackTick}
        isDead={gameOver}
      />

      {enemies.map((e) => (
        <EnemyCharacter
          key={e.id}
          position={[e.x, 0, e.z]}
          hpRatio={Math.max(0, e.hp / e.maxHp)}
        />
      ))}
    </group>
  );
}
