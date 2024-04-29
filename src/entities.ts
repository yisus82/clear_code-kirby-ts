import { KaboomCtx } from 'kaboom';
import { PLAYER_HEALTH, PLAYER_JUMP_FORCE, PLAYER_SPEED, SCALE } from './constants';

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
