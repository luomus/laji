import { V3, V4 } from '../math-3d';

export class LightSource {
  get direction() { return this._direction; } set direction(d: V3) { this._direction = d; this.setDirty(); }
  get color()     { return this._color; }     set color(c: V4)     { this._color = c;     this.setDirty(); }

  private _direction: V3; private _color: V4;

  private dirty = true;

  wasDirty() { const b = this.dirty; this.dirty = false; return b; }

  private setDirty() { this.dirty = true; }
}
