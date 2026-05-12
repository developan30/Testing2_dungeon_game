import { create } from 'zustand';

export type Enemy = {
  id: number;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
};

type Player = {
  x: number;
  z: number;
  hp: number;
  maxHp: number;
};

type State = {
  player: Player;
  enemies: Enemy[];
  score: number;
  wave: number;
  gameOver: boolean;
  keys: Record<string, boolean>;
  attackTick: number;
  spawnWave: () => void;
  tick: (dt: number) => void;
  attack: () => void;
  restart: () => void;
  setKey: (k: string, v: boolean) => void;
};

let enemyId = 0;

const spawn = (wave: number): Enemy[] =>
  Array.from({ length: 2 + wave }, () => ({
    id: enemyId++,
    x: (Math.random() - 0.5) * 12,
    z: (Math.random() - 0.5) * 12,
    hp: 20 + wave * 6,
    maxHp: 20 + wave * 6,
  }));

export const useGame = create<State>((set, get) => ({
  player: { x: 0, z: 0, hp: 100, maxHp: 100 },
  enemies: [],
  score: 0,
  wave: 1,
  gameOver: false,
  keys: {},
  attackTick: 0,

  spawnWave: () => set((s) => ({ enemies: spawn(s.wave) })),

  setKey: (k, v) => set((s) => ({ keys: { ...s.keys, [k]: v } })),

  attack: () =>
    set((s) => {
      if (s.gameOver) return s;

      const nextEnemies = s.enemies
        .map((e) => {
          const d = Math.hypot(e.x - s.player.x, e.z - s.player.z);
          return d < 2.2 ? { ...e, hp: e.hp - 15 } : e;
        })
        .filter((e) => e.hp > 0);

      const kills = s.enemies.filter((e) => {
        const d = Math.hypot(e.x - s.player.x, e.z - s.player.z);
        return d < 2.2 && e.hp <= 15;
      }).length;

      return {
        attackTick: s.attackTick + 1,
        enemies: nextEnemies,
        score: s.score + kills * 10,
      };
    }),

  tick: (dt) => {
    const s = get();
    if (s.gameOver) return;

    let { x, z, hp, maxHp } = s.player;
    const sp = 4 * dt;

    if (s.keys.w) z -= sp;
    if (s.keys.s) z += sp;
    if (s.keys.a) x -= sp;
    if (s.keys.d) x += sp;

    x = Math.max(-8, Math.min(8, x));
    z = Math.max(-8, Math.min(8, z));

    let damage = 0;
    const enemies = s.enemies.map((e) => {
      const dx = x - e.x;
      const dz = z - e.z;
      const d = Math.hypot(dx, dz) || 1;
      const ms = 1.5 * dt + 0.25 * dt * s.wave;
      const nx = e.x + (dx / d) * ms;
      const nz = e.z + (dz / d) * ms;

      if (d < 1.3) damage += 8 * dt;

      return { ...e, x: nx, z: nz };
    });

    hp = Math.max(0, hp - damage);
    const cleared = enemies.length === 0;

    set({
      player: { x, z, hp, maxHp },
      enemies: cleared ? spawn(s.wave + 1) : enemies,
      wave: cleared ? s.wave + 1 : s.wave,
      gameOver: hp <= 0,
    });
  },

  restart: () =>
    set({
      player: { x: 0, z: 0, hp: 100, maxHp: 100 },
      enemies: spawn(1),
      score: 0,
      wave: 1,
      gameOver: false,
      keys: {},
      attackTick: 0,
    }),
}));
