import { M4, V3, V4 } from '../math-3d';
import { LightSource } from './light-source';
import { SceneObjectTransform } from './scene-object-transform';

interface SceneUpdate {
  cameraTransform?: M4;
  objectTransform?: M4;
  objectMesh?: Mesh;
  lights?: { direction: V3; color: V4 }[];
}

interface Mesh {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

export class Scene {
  cameraTransform = new SceneObjectTransform();
  objectTransform = new SceneObjectTransform();

  lightSources: LightSource[];

  get objectMesh() { return this._objectMesh; }
  set objectMesh(m: Mesh) { this._objectMesh = m; this.objectMeshIsDirty = true; }
  private _objectMesh: Mesh;
  private objectMeshIsDirty = false;

  getSceneUpdate(): SceneUpdate {
    const sceneUpdate: SceneUpdate = {};
    if (this.cameraTransform.wasDirty()) {
      sceneUpdate.cameraTransform = this.cameraTransform.getTransform();
    }
    if (this.objectTransform.wasDirty()) {
      sceneUpdate.objectTransform = this.objectTransform.getTransform();
    }
    if (this.objectMeshIsDirty) {
      sceneUpdate.objectMesh = this.objectMesh;
      this.objectMeshIsDirty = false;
    }
    if (this.wereLightSourcesDirty()) {
      sceneUpdate.lights = this.lightSources.map(l => ({ direction: l.direction, color: l.color }));
    }

    return sceneUpdate;
  }

  private wereLightSourcesDirty(): boolean {
    if (this.lightSources.filter(l => l.wasDirty()).length > 0) {
      return true;
    }
    return false;
  };
}
