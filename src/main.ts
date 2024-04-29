import { BACKGROUND_COLOR, GRAVITY } from './constants';
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
  });
  k.go('level-1');
};

gameSetup();
