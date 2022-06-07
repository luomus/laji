import { Deg, V2 } from '../math';
import { EsAnimatable } from './es-animatable';

export class CurveFollower implements EsAnimatable {
  public pos: V2 = [0, 0];
  public rot: Deg = 0;

  private timeElapsed = 0;

  constructor(private points: [V2, V2, V2], private duration: number) {}

  update(dt: number) {
    this.timeElapsed += dt;
    const newPos = V2.quadraticBezier(this.points[0], this.points[1], this.points[2], this.timeElapsed / this.duration);
    const toNewPos = V2.sub(newPos, this.pos);
    this.pos = newPos;
    this.rot = V2.toDeg([toNewPos[0], -toNewPos[1]]); // flip y axis

    if (this.timeElapsed >= this.duration) {
      return false;
    }
    return true;
  }
}
