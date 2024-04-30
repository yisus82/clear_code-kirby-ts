import { KaboomCtx } from 'kaboom';
import {
  BIRD_DISTANCE_THRESHOLD,
  BIRD_POSSIBLE_SPEEDS,
  FLAME_JUMP_FORCE,
  GUY_SPEED,
  PLAYER_HEALTH,
  PLAYER_JUMP_FORCE,
  PLAYER_SPEED,
  SCALE,
} from './constants';

export const makePlayer = (k: KaboomCtx, spawnPoint: { x: number; y: number }) => {
  // create player
  const player = k.make([
    k.sprite('sprites', { anim: 'kirbyIdle' }),
    k.area({ shape: new k.Rect(k.vec2(4, 5.9), 8, 10) }),
    k.body(),
    k.pos(spawnPoint.x * SCALE, spawnPoint.y * SCALE),
    k.scale(SCALE),
    k.doubleJump(PLAYER_JUMP_FORCE),
    k.health(PLAYER_HEALTH),
    k.opacity(1),
    {
      speed: PLAYER_SPEED,
      direction: 'right',
      isInhaling: false,
      isFull: false,
    },
    'player',
  ]);

  // horizontal movement
  k.onKeyDown(key => {
    if (key === 'left' || key === 'a') {
      player.direction = 'left';
      player.flipX = true;
      player.move(-player.speed, 0);
    } else if (key === 'right' || key === 'd') {
      player.direction = 'right';
      player.flipX = false;
      player.move(player.speed, 0);
    }
  });

  // jump
  k.onKeyPress(key => {
    if (key === 'up' || key === 'w') {
      player.doubleJump();
    }
  });

  return player;
};

export function makeFlameEnemy(k: KaboomCtx, spawnPoint: { x: number; y: number }) {
  // create flame
  const flame = k.add([
    k.sprite('sprites', { anim: 'flame' }),
    k.scale(SCALE),
    k.pos(spawnPoint.x * SCALE, spawnPoint.y * SCALE),
    k.area({
      shape: new k.Rect(k.vec2(4, 6), 8, 10),
      collisionIgnore: ['enemy'],
    }),
    k.body(),
    k.state('idle', ['idle', 'jump']),
    'enemy',
  ]);

  // state machine
  // idle -> jump -> idle
  flame.onStateEnter('idle', async () => {
    await k.wait(1);
    flame.enterState('jump');
  });

  flame.onStateEnter('jump', async () => {
    flame.jump(FLAME_JUMP_FORCE);
  });

  flame.onStateUpdate('jump', async () => {
    if (flame.isGrounded()) {
      flame.enterState('idle');
    }
  });

  return flame;
}

export function makeGuyEnemy(k: KaboomCtx, spawnPoint: { x: number; y: number }) {
  // create guy
  const guy = k.add([
    k.sprite('sprites', { anim: 'guyWalk' }),
    k.scale(SCALE),
    k.pos(spawnPoint.x * SCALE, spawnPoint.y * SCALE),
    k.area({
      shape: new k.Rect(k.vec2(2, 3.9), 12, 12),
      collisionIgnore: ['enemy'],
    }),
    k.body(),
    k.state('idle', ['idle', 'left', 'right', 'jump']),
    { isInhalable: false, speed: GUY_SPEED },
    'enemy',
  ]);

  // state machine
  // idle -> left -> right -> idle
  guy.onStateEnter('idle', async () => {
    await k.wait(1);
    guy.enterState('left');
  });

  guy.onStateEnter('left', async () => {
    guy.flipX = false;
    await k.wait(2);
    guy.enterState('right');
  });

  guy.onStateUpdate('left', () => {
    guy.move(-guy.speed, 0);
  });

  guy.onStateEnter('right', async () => {
    guy.flipX = true;
    await k.wait(2);
    guy.enterState('left');
  });

  guy.onStateUpdate('right', () => {
    guy.move(guy.speed, 0);
  });

  return guy;
}

export function makeBirdEnemy(k: KaboomCtx, spawnPoint: { x: number; y: number }) {
  // randomize speed
  const speed = k.choose(BIRD_POSSIBLE_SPEEDS);

  // create bird
  const bird = k.add([
    k.sprite('sprites', { anim: 'bird' }),
    k.scale(SCALE),
    k.pos(spawnPoint.x * SCALE, spawnPoint.y * SCALE),
    k.area({
      shape: new k.Rect(k.vec2(4, 6), 8, 10),
      collisionIgnore: ['enemy'],
    }),
    k.body({ isStatic: true }),
    k.move(k.LEFT, speed),
    k.offscreen({ destroy: true, distance: BIRD_DISTANCE_THRESHOLD }),
    'enemy',
  ]);

  return bird;
}
