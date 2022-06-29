import { Deg, V2 } from '../math';

export interface EsAnimatable {
  pos: V2;
  rot: Deg;
  update(dt: number): boolean;
}
