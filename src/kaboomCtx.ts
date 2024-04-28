import kaboom from 'kaboom';
import { SCALE, SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';

export const k = kaboom({
  width: SCREEN_WIDTH * SCALE,
  height: SCREEN_HEIGHT * SCALE,
  scale: SCALE,
  letterbox: true,
  global: false,
});
