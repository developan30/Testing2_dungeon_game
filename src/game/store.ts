import { create } from 'zustand';

export type Enemy = { id:number; x:number; z:number; hp:number; maxHp:number; vx:number; vz:number; hitFlash:number };
type Player = { x:number; z:number; hp:number; maxHp:number; vx:number; vz:number; facing:number };

type State = {
  player: Player; enemies: Enemy[]; score:number; wave:number; gameOver:boolean; keys:Record<string,boolean>; attackTick:number;
  spawnWave:()=>void; tick:(dt:number)=>void; attack:()=>void; restart:()=>void; setKey:(k:string,v:boolean)=>void;
};

let enemyId = 0;
const spawn = (wave:number):Enemy[] => Array.from({length:2+wave},()=>({id:enemyId++,x:(Math.random()-0.5)*12,z:(Math.random()-0.5)*12,hp:20+wave*6,maxHp:20+wave*6,vx:0,vz:0,hitFlash:0}));

export const useGame = create<State>((set,get)=>({
  player:{x:0,z:0,hp:100,maxHp:100,vx:0,vz:0,facing:0}, enemies:[], score:0,wave:1,gameOver:false,keys:{},attackTick:0,
  spawnWave:()=>set(s=>({enemies:spawn(s.wave)})),
  setKey:(k,v)=>set(s=>({keys:{...s.keys,[k]:v}})),
  attack:()=>set(s=>{
    if(s.gameOver)return s;
    const px=s.player.x,pz=s.player.z;
    const next=s.enemies.map(e=>{
      const dx=e.x-px,dz=e.z-pz,d=Math.hypot(dx,dz);
      if(d<2.4){const k=0.8/(d||1); return {...e,hp:e.hp-15,vx:e.vx+dx*k,vz:e.vz+dz*k,hitFlash:0.2};}
      return e;
    }).filter(e=>e.hp>0);
    const kills=s.enemies.filter(e=>Math.hypot(e.x-px,e.z-pz)<2.4 && e.hp<=15).length;
    return {attackTick:s.attackTick+1,enemies:next,score:s.score+kills*10};
  }),
  tick:(dt)=>{
    const s=get(); if(s.gameOver) return;
    const accel=18, drag=10, max=4;
    let {x,z,hp,maxHp,vx,vz,facing}=s.player;
    const ix=(s.keys.d?1:0)-(s.keys.a?1:0); const iz=(s.keys.s?1:0)-(s.keys.w?1:0);
    const il=Math.hypot(ix,iz)||1;
    const tx=(ix/il)*max, tz=(iz/il)*max;
    vx += (tx-vx)*Math.min(1,accel*dt);
    vz += (tz-vz)*Math.min(1,accel*dt);
    if(ix===0&&iz===0){vx*=Math.max(0,1-drag*dt); vz*=Math.max(0,1-drag*dt);} 
    x=Math.max(-8,Math.min(8,x+vx*dt)); z=Math.max(-8,Math.min(8,z+vz*dt));
    if(Math.hypot(vx,vz)>0.15) facing=Math.atan2(vx,vz);

    let damage=0;
    const enemies=s.enemies.map((e,i,arr)=>{
      let dx=x-e.x,dz=z-e.z,d=Math.hypot(dx,dz)||1;
      const speed=1.2+0.2*s.wave;
      let evx=e.vx+(dx/d)*speed*dt*2;
      let evz=e.vz+(dz/d)*speed*dt*2;
      arr.forEach((o,j)=>{if(i===j)return; const rx=e.x-o.x,rz=e.z-o.z,rd=Math.hypot(rx,rz); if(rd>0&&rd<0.9){evx+=(rx/rd)*1.2*dt; evz+=(rz/rd)*1.2*dt;}});
      evx*=0.9; evz*=0.9;
      const nx=e.x+evx*dt, nz=e.z+evz*dt;
      d=Math.hypot(x-nx,z-nz);
      if(d<1.25) damage += 10*dt;
      return {...e,x:nx,z:nz,vx:evx,vz:evz,hitFlash:Math.max(0,e.hitFlash-dt)};
    });
    hp=Math.max(0,hp-damage);
    const cleared=enemies.length===0;
    set({player:{x,z,hp,maxHp,vx,vz,facing},enemies:cleared?spawn(s.wave+1):enemies,wave:cleared?s.wave+1:s.wave,gameOver:hp<=0});
  },
  restart:()=>set({player:{x:0,z:0,hp:100,maxHp:100,vx:0,vz:0,facing:0},enemies:spawn(1),score:0,wave:1,gameOver:false,keys:{},attackTick:0}),
}));
