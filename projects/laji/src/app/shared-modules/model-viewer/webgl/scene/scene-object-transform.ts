import { V3, M4 } from '../math-3d';

export class SceneObjectTransform {
  get position() { return this._position; } set position(p: V3) { this._position = p; this.setDirty(); }
  get rotation() { return this._rotation; } set rotation(r: V3) { this._rotation = r; this.setDirty(); }
  get scale()    { return this._scale; }    set scale(s: V3)    { this._scale = s;    this.setDirty(); }

  private _position: V3 = [0,0,0]; private _rotation: V3 = [0,0,0]; private _scale: V3 = [1,1,1];

  private dirty = true;
  private transform: M4; // TODO edit transform upon change in position, rotation, scale

  getTransform() { return this.transform; }
  wasDirty() { const b = this.dirty; this.dirty = false; return b; }

  private setDirty() { this.dirty = true; }
}
