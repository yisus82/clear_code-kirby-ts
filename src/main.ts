import {
  BACKGROUND_COLOR,
  CAMERA_OFFSET_X,
  CAMERA_OFFSET_Y,
  CAMERA_SCALE,
  GRAVITY,
} from './constants';
import { makePlayer } from './entities';
import { k } from './kaboomCtx';
import { makeMap } from './utils';

const gameSetup = async () => {
  k.loadSprite('sprites', '/spritesheet.png', {
    sliceX: 9,
    sliceY: 10,
    anims: {
      kirbyIdle: 0,
      kirbyInhaling: 1,
      kirbyFull: 2,
      kirbyInhaleEffect: { from: 3, to: 8, speed: 15, loop: true },
      shootingStar: 9,
      flame: { from: 36, to: 37, speed: 4, loop: true },
      guyIdle: 18,
      guyWalk: { from: 18, to: 19, speed: 4, loop: true },
      bird: { from: 27, to: 28, speed: 4, loop: true },
    },
  });
  k.loadSprite('level-1', '/level-1.png');
  const {
    map: level1Map,
    spawnPoints: level1SpawnPoints,
    error: level1Error,
  } = await makeMap(k, 'level-1');
  if (level1Error) {
    console.error('Error loading map:', level1Error);
    return;
  }
  k.scene('level-1', () => {
    k.setGravity(GRAVITY);
    k.add([k.rect(k.width(), k.height()), k.color(k.Color.fromHex(BACKGROUND_COLOR)), k.fixed()]);
    k.add(level1Map);
    const player = makePlayer(k, level1SpawnPoints.player[0]);
    k.add(player);
    k.camScale(k.vec2(CAMERA_SCALE));
    k.onUpdate(() => {
      k.camPos(player.pos.x + CAMERA_OFFSET_X, player.pos.y + CAMERA_OFFSET_Y);
    });
  });
  k.go('level-1');
};

gameSetup();
