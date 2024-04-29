import { KaboomCtx } from 'kaboom';
import { SCALE } from './constants';
import { TiledMap } from './types';

export const makeMap = async (k: KaboomCtx, name: string) => {
  let error = null;
  const mapData: TiledMap = await fetch(`/${name}.json`)
    .then(res => res.json())
    .catch(e => (error = e));
  const map = k.make([k.sprite(name), k.scale(SCALE), k.pos(0)]);
  const spawnPoints: { [key: string]: { x: number; y: number }[] } = {};

  for (const layer of mapData.layers) {
    const layerObjects = layer.objects ?? [];
    if (layer.name === 'colliders') {
      for (const collider of layerObjects) {
        map.add([
          // collider area
          k.area({
            shape: new k.Rect(k.vec2(0), collider.width, collider.height),
            collisionIgnore: ['platform', 'exit'],
          }),
          // collider physics
          collider.name !== 'exit' ? k.body({ isStatic: true }) : null,
          // collider position
          k.pos(collider.x, collider.y),
          // collider tag
          collider.name !== 'exit' ? 'platform' : 'exit',
        ]);
      }
    } else if (layer.name === 'spawnpoints') {
      for (const spawnPoint of layerObjects) {
        const newSpawnPoint = {
          x: spawnPoint.x,
          y: spawnPoint.y,
        };
        if (spawnPoints[spawnPoint.name]) {
          spawnPoints[spawnPoint.name].push(newSpawnPoint);
        } else {
          spawnPoints[spawnPoint.name] = [newSpawnPoint];
        }
      }
    }
  }

  return { map, spawnPoints, error };
};
