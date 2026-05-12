import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Character } from './Character';
import { EnemyCharacter } from './EnemyCharacter';
import { useGame } from '../game/store';

type DamageText = { id:number; x:number; z:number; value:number; life:number };

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
    setTexts((curr) => curr.map((t) => ({ ...t, y: 0, life: t.life - dt, z: t.z - dt * 0.2 })).filter((t) => t.life > 0));
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

  return <group><mesh rotation-x={-Math.PI/2} receiveShadow><planeGeometry args={[20,20]} /><meshStandardMaterial color="#2d2d33" roughness={1} /></mesh>{[[0,2,-10],[0,2,10],[-10,2,0],[10,2,0]].map((p,i)=><mesh key={i} position={p as [number,number,number]} rotation-y={i>1?Math.PI/2:0}><boxGeometry args={[20,4,0.5]} /><meshStandardMaterial color="#4a4a50" /></mesh>)}<Character position={[player.x,0,player.z]} moving={isMoving&&!gameOver} attackTick={attackTick} facing={player.facing} isDead={gameOver} />{enemies.map((e)=><EnemyCharacter key={e.id} position={[e.x,0,e.z]} hpRatio={Math.max(0,e.hp/e.maxHp)} hitFlash={e.hitFlash} />)}{texts.map((t)=><group key={t.id} position={[t.x,1.8+(1-t.life)*0.8,t.z]}><mesh><planeGeometry args={[0.42,0.2]} /><meshBasicMaterial color="#000" transparent opacity={0.35} /></mesh></group>)}</group>;
}
