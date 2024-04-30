import { GameObj, KaboomCtx } from 'kaboom';
import {
  BIRD_DISTANCE_THRESHOLD,
  BIRD_POSSIBLE_SPEEDS,
  ENEMY_INHALE_FORCE,
  FLAME_JUMP_FORCE,
  GUY_SPEED,
  INHALE_EFFECT_OFFSET,
  PLAYER_HEALTH,
  PLAYER_JUMP_FORCE,
  PLAYER_SPEED,
  SCALE,
} from './constants';
import { globalGameState } from './state';

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

  // damage
  player.onCollide('enemy', async (enemy: GameObj) => {
    // if enemy is inhaleable
    if (player.isInhaling && enemy.isInhalable) {
      player.isInhaling = false;
      k.destroy(enemy);
      player.isFull = true;
      return;
    }

    // hurt player
    player.hurt();

    // check if player is dead
    if (player.hp() <= 0) {
      // destroy player
      k.destroy(player);
      // load lose scene
      k.go('lose');
    } else {
      // flash player
      await k.tween(player.opacity, 0, 0.25, val => (player.opacity = val), k.easings.linear);
      await k.tween(player.opacity, 1, 0.25, val => (player.opacity = val), k.easings.linear);
    }
  });

  // create inhale effect
  const inhaleEffect = k.add([
    k.sprite('sprites', { anim: 'kirbyInhaleEffect' }),
    k.pos(),
    k.scale(SCALE),
    k.opacity(0),
    'inhaleEffect',
  ]);

  // create inhale zone
  const inhaleZone = player.add([
    k.area({ shape: new k.Rect(k.vec2(0), 20, 4) }),
    k.pos(),
    'inhaleZone',
  ]);
  inhaleZone.onUpdate(() => {
    if (player.direction === 'left') {
      inhaleZone.pos = k.vec2(-14, 8);
      inhaleEffect.pos = k.vec2(player.pos.x - INHALE_EFFECT_OFFSET, player.pos.y + 0);
      inhaleEffect.flipX = true;
    } else {
      inhaleZone.pos = k.vec2(14, 8);
      inhaleEffect.pos = k.vec2(player.pos.x + INHALE_EFFECT_OFFSET, player.pos.y + 0);
      inhaleEffect.flipX = false;
    }
  });

  // inhale
  k.onKeyDown('space', () => {
    if (player.isFull) {
      player.isInhaling = false;
      player.play('kirbyFull');
      inhaleEffect.opacity = 0;
    } else {
      player.isInhaling = true;
      player.play('kirbyInhaling');
      inhaleEffect.opacity = 1;
    }
  });

  // inhale release
  k.onKeyRelease('space', () => {
    if (player.isFull) {
      player.play('kirbyInhaling');
      const shootingStar = k.add([
        k.sprite('sprites', {
          anim: 'shootingStar',
          flipX: player.direction === 'right',
        }),
        k.area({ shape: new k.Rect(k.vec2(5, 4), 6, 6) }),
        k.pos(
          player.direction === 'left' ? player.pos.x - 80 : player.pos.x + 80,
          player.pos.y + 5
        ),
        k.scale(SCALE),
        player.direction === 'left' ? k.move(k.LEFT, 800) : k.move(k.RIGHT, 800),
        'shootingStar',
      ]);
      shootingStar.onCollide('platform', () => k.destroy(shootingStar));
      player.isFull = false;
      k.wait(1, () => player.play('kirbyIdle'));
    } else {
      player.isInhaling = false;
      player.play('kirbyIdle');
      inhaleEffect.opacity = 0;
    }
  });

  // go to next scene
  player.onCollide('exit', () => {
    k.go(globalGameState.nextScene);
  });

  // reset scene
  player.onUpdate(() => {
    if (player.pos.y > 2000) {
      k.go(globalGameState.currentScene);
    }
  });

  return player;
};

export const makeInhalable = (k: KaboomCtx, enemy: GameObj) => {
  enemy.onCollide('inhaleZone', () => {
    enemy.isInhalable = true;
  });

  enemy.onCollideEnd('inhaleZone', () => {
    enemy.isInhalable = false;
  });

  enemy.onCollide('shootingStar', (shootingStar: GameObj) => {
    k.destroy(enemy);
    k.destroy(shootingStar);
  });

  const playerRef = k.get('player')[0];
  enemy.onUpdate(() => {
    if (playerRef.isInhaling && enemy.isInhalable) {
      if (playerRef.direction === 'right') {
        enemy.move(-ENEMY_INHALE_FORCE, 0);
      } else {
        enemy.move(ENEMY_INHALE_FORCE, 0);
      }
    }
  });
};

export const makeFlameEnemy = (k: KaboomCtx, spawnPoint: { x: number; y: number }) => {
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

  // make flame inhaleable
  makeInhalable(k, flame);

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
};

export const makeGuyEnemy = (k: KaboomCtx, spawnPoint: { x: number; y: number }) => {
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

  // make guy inhaleable
  makeInhalable(k, guy);

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
};

export const makeBirdEnemy = (k: KaboomCtx, spawnPoint: { x: number; y: number }) => {
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

  // make bird inhaleable
  makeInhalable(k, bird);

  return bird;
};
