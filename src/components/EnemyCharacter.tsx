import { useMemo, useRef } from 'react';
import { Group, MathUtils } from 'three';
import { useFrame } from '@react-three/fiber';

type EnemyCharacterProps = { position:[number,number,number]; hpRatio:number; hitFlash:number };
export function EnemyCharacter({ position, hpRatio, hitFlash }: EnemyCharacterProps) {
  const root=useRef<Group>(null); const t=useRef(Math.random()*100); const prev=useRef<[number,number,number]>(position); const base=useMemo(()=> '#6d8b54',[]);
  useFrame((_,dt)=>{t.current+=dt; const dx=position[0]-prev.current[0],dz=position[2]-prev.current[2]; prev.current=position; if(root.current){root.current.position.set(position[0],position[1]+Math.sin(t.current*4)*0.08,position[2]); if(Math.hypot(dx,dz)>0.001){const yaw=Math.atan2(dx,dz); root.current.rotation.y=MathUtils.lerp(root.current.rotation.y,yaw,dt*8);} root.current.rotation.z=Math.sin(t.current*5)*0.05;}});
  const color = hitFlash > 0 ? '#ffffff' : base;
  return <group ref={root}><mesh position={[0,0.55,0]}><sphereGeometry args={[0.45,10,10]}/><meshStandardMaterial color={color}/></mesh><mesh position={[0,0.2,0]}><cylinderGeometry args={[0.3,0.38,0.45,8]}/><meshStandardMaterial color={hitFlash>0?'#fdd':'#4e643d'}/></mesh><group position={[0,1.3,0]}><mesh><planeGeometry args={[0.9,0.1]}/><meshBasicMaterial color="#222"/></mesh><mesh position={[-0.45+0.45*hpRatio,0,0.01]}><planeGeometry args={[0.9*hpRatio,0.08]}/><meshBasicMaterial color="#4f4"/></mesh></group></group>;
}
