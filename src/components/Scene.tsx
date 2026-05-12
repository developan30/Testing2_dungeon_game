import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Character } from './Character';
import { EnemyCharacter } from './EnemyCharacter';
import { useGame } from '../game/store';

type DamageText = { id:number; x:number; z:number; value:number; life:number };

function DungeonEnvironment() {
  const tiles = useMemo(() => {
    const out: Array<{ x:number; z:number; h:number; c:string }> = [];
    for (let x = -10; x < 10; x += 1) {
      for (let z = -10; z < 10; z += 1) {
        const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
        const r = n - Math.floor(n);
        out.push({
          x: x + 0.5,
          z: z + 0.5,
          h: (r - 0.5) * 0.04,
          c: r > 0.5 ? '#2f2f35' : '#34343a',
        });
      }
    }
    return out;
  }, []);

  const torches: Array<[number, number, number]> = [
    [-8.8, 1.7, -6], [-8.8, 1.7, 6], [8.8, 1.7, -6], [8.8, 1.7, 6],
    [-6, 1.7, -8.8], [6, 1.7, -8.8], [-6, 1.7, 8.8], [6, 1.7, 8.8],
  ];

  return (
    <group>
      {tiles.map((t, i) => (
        <mesh key={i} position={[t.x, t.h, t.z]} receiveShadow>
          <boxGeometry args={[0.98, 0.12, 0.98]} />
          <meshStandardMaterial color={t.c} roughness={0.95} metalness={0.05} />
        </mesh>
      ))}

      {[[0,2,-10],[0,2,10],[-10,2,0],[10,2,0]].map((p,i)=>(
        <mesh key={i} position={p as [number,number,number]} rotation-y={i>1?Math.PI/2:0} castShadow receiveShadow>
          <boxGeometry args={[20,4,0.6]} />
          <meshStandardMaterial color="#47474e" roughness={0.9} />
        </mesh>
      ))}

      {torches.map((p, i) => (
        <group key={i} position={p}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.07, 0.45, 8]} />
            <meshStandardMaterial color="#6f5842" />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color="#ffb35a" />
          </mesh>
          <pointLight color="#ff9b47" intensity={1.1} distance={5} decay={2} position={[0, 0.3, 0]} />
        </group>
      ))}
    </group>
  );
}

export function Scene() {
  const { player, enemies, tick, setKey, attack, restart, gameOver, attackTick, keys } = useGame();
  const [texts, setTexts] = useState<DamageText[]>([]);
  const prevHp = useRef<Record<number, number>>({});
  const idRef = useRef(0);

  useEffect(() => {
    restart();
    const kd = (e: KeyboardEvent) => { const k=e.key.toLowerCase(); if(['w','a','s','d'].includes(k)) setKey(k,true); if(k===' ') attack(); };
    const ku = (e: KeyboardEvent) => setKey(e.key.toLowerCase(), false);
    const md = () => attack();
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('mousedown', md);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('mousedown', md); };
  }, [attack, restart, setKey]);

  useFrame((_, dt) => {
    tick(Math.min(dt, 0.033));
    setTexts((curr) => curr.map((t) => ({ ...t, life: t.life - dt, z: t.z - dt * 0.2 })).filter((t) => t.life > 0));
  });

  useEffect(() => {
    const next = { ...prevHp.current };
    const spawned: DamageText[] = [];
    enemies.forEach((e) => {
      const old = prevHp.current[e.id] ?? e.hp;
      const dmg = Math.max(0, old - e.hp);
      if (dmg > 0.1) spawned.push({ id: idRef.current++, x: e.x, z: e.z, value: Math.round(dmg), life: 0.7 });
      next[e.id] = e.hp;
    });
    prevHp.current = next;
    if (spawned.length) setTexts((s) => [...s, ...spawned]);
  }, [attackTick, enemies]);

  const isMoving = Boolean(keys.w || keys.a || keys.s || keys.d);

  return <group><DungeonEnvironment /><Character position={[player.x,0,player.z]} moving={isMoving&&!gameOver} attackTick={attackTick} facing={player.facing} isDead={gameOver} />{enemies.map((e)=><EnemyCharacter key={e.id} position={[e.x,0,e.z]} hpRatio={Math.max(0,e.hp/e.maxHp)} hitFlash={e.hitFlash} />)}{texts.map((t)=><group key={t.id} position={[t.x,1.8+(1-t.life)*0.8,t.z]}><mesh><planeGeometry args={[0.42,0.2]} /><meshBasicMaterial color="#000" transparent opacity={0.35} /></mesh></group>)}</group>;
}
