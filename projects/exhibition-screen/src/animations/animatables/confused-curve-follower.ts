import { Deg, V2 } from '../math';
import { EsAnimatable } from './es-animatable';

export class ConfusedCurveFollower implements EsAnimatable {
  public pos: V2 = [0, 0];
  public rot: Deg = 0;

  private wobbleFreq = 1 + Math.random() / 2;
  private wobbleAmplitude = Math.random() * 100;

  private prevBezier: V2 = [0, 0];
  private timeElapsed = 0;

  constructor(private points: [V2, V2, V2], private duration: number) {}

  update(dt: number) {
    // advance time
    this.timeElapsed += dt;

    // get new position
    const newBezier = V2.quadraticBezier(this.points[0], this.points[1], this.points[2], this.timeElapsed / this.duration);

    // get wobble
    const tangent = V2.sub(newBezier, this.prevBezier);
    const perpendicular = V2.perp(tangent);
    const mult = Math.sin(this.wobbleFreq * 2 * Math.PI * this.timeElapsed / this.duration) * this.wobbleAmplitude;
    const finalPos = V2.add(newBezier, V2.scale(V2.normalize(perpendicular), mult));

    // set final position and rotation
    const oldToNewPos = V2.sub(finalPos, this.pos);
    this.pos = finalPos;
    this.rot = V2.toDeg([oldToNewPos[0], -oldToNewPos[1]]); // flip y axis

    this.prevBezier = newBezier;

    // check end condition
    if (this.timeElapsed >= this.duration) {
      return false;
    }
    return true;
  }
}
