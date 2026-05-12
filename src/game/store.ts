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
  setKey: (key: string, value: boolean) => void;
};

let enemyId = 0;

const spawn = (wave: number): Enemy[] => {
  return Array.from({ length: 2 + wave }, () => {
    const hp = 20 + wave * 6;

    return {
      id: enemyId++,
      x: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 12,
      hp,
      maxHp: hp,
    };
  });
};

const initialPlayer = (): Player => ({
  x: 0,
  z: 0,
  hp: 100,
  maxHp: 100,
});

export const useGame = create<State>((set, get) => ({
  player: initialPlayer(),
  enemies: [],
  score: 0,
  wave: 1,
  gameOver: false,
  keys: {},
  attackTick: 0,

  spawnWave: () => {
    set((state) => ({
      enemies: spawn(state.wave),
    }));
  },

  setKey: (key, value) => {
    set((state) => ({
      keys: {
        ...state.keys,
        [key]: value,
      },
    }));
  },

  attack: () => {
    set((state) => {
      if (state.gameOver) {
        return state;
      }

      let killed = 0;

      const enemies = state.enemies
        .map((enemy) => {
          const distance = Math.hypot(
            enemy.x - state.player.x,
            enemy.z - state.player.z
          );

          if (distance > 2.2) {
            return enemy;
          }

          const hp = enemy.hp - 15;

          if (hp <= 0) {
            killed += 1;
          }

          return {
            ...enemy,
            hp,
          };
        })
        .filter((enemy) => enemy.hp > 0);

      return {
        attackTick: state.attackTick + 1,
        enemies,
        score: state.score + killed * 10,
      };
    });
  },

  tick: (dt) => {
    const state = get();

    if (state.gameOver) {
      return;
    }

    let { x, z, hp, maxHp } = state.player;

    const speed = 4 * dt;

    if (state.keys.w || state.keys.ArrowUp) z -= speed;
    if (state.keys.s || state.keys.ArrowDown) z += speed;
    if (state.keys.a || state.keys.ArrowLeft) x -= speed;
    if (state.keys.d || state.keys.ArrowRight) x += speed;

    x = Math.max(-8, Math.min(8, x));
    z = Math.max(-8, Math.min(8, z));

    let damage = 0;

    const enemies = state.enemies.map((enemy) => {
      const dx = x - enemy.x;
      const dz = z - enemy.z;
      const distance = Math.hypot(dx, dz) || 1;
      const moveSpeed = 1.5 * dt + 0.25 * dt * state.wave;

      const nextX = enemy.x + (dx / distance) * moveSpeed;
      const nextZ = enemy.z + (dz / distance) * moveSpeed;

      if (distance < 1.3) {
        damage += 8 * dt;
      }

      return {
        ...enemy,
        x: nextX,
        z: nextZ,
      };
    });

    hp = Math.max(0, hp - damage);

    const waveCleared = enemies.length === 0;
    const nextWave = waveCleared ? state.wave + 1 : state.wave;

    set({
      player: {
        x,
        z,
        hp,
        maxHp,
      },
      enemies: waveCleared ? spawn(nextWave) : enemies,
      wave: nextWave,
      gameOver: hp <= 0,
    });
  },

  restart: () => {
    set({
      player: initialPlayer(),
      enemies: spawn(1),
      score: 0,
      wave: 1,
      gameOver: false,
      keys: {},
      attackTick: 0,
    });
  },
}));