import { M4, V3, V4 } from './math-3d';
import { bufferPositions, bufferNormals, bufferIndices, glInitializeProgram } from './webgl-utils';
import { GLB } from './glb-parser';

interface Scene {
  camera: Camera;
  directionLights: DirectionLight[];
  entity?: Entity;
}

interface Camera {
  transform: Transform;
  projection: M4;
}

interface DirectionLight {
  direction: V3;
  color: V4;
}

interface Entity {
  transform: Transform;
  mesh: Mesh;
}

interface Mesh {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

type Transform = M4;

const constructEmptyScene = (canvasWidth: number, canvasHeight: number): Scene => ({
  camera: {
    transform: M4.translation(0, 0, 50),
    projection: M4.perspective(
      Math.PI / 2,
      canvasWidth / canvasHeight,
      1,
      4000
    )
  },
  directionLights: [{
    direction: [-0.5, -0.7, -1],
    color: [0.2, 1, 0.2, 1]
  }]
});

const entityFromGLB = (bufferData: GLB.BufferData[], jsonData: GLB.JSONData): Entity => {
  // set up the models transform
  const nodeTranslation: [number, number, number] = jsonData.nodes[0].translation;
  const nodeRotation: [number, number, number, number] = jsonData.nodes[0].rotation; // quaternion
  const nodeScale: [number, number, number] = jsonData.nodes[0].scale;
  const T = M4.translation(nodeTranslation[0], nodeTranslation[0], nodeTranslation[0]);
  const R = M4.rotationFromQuaternion(...nodeRotation);
  const S = M4.scaling(...nodeScale);
  const nodeTransform = M4.mult(
    T, M4.mult(
      R, S
    )
  );
  const transform = nodeTransform;

  // only supports a single mesh and primitive atm
  const primitive = jsonData.meshes[0].primitives[0];

  const mesh: Mesh = {
    positions: <Float32Array>bufferData[primitive.attributes.POSITION].data,
    normals: <Float32Array>bufferData[primitive.attributes.NORMAL].data,
    indices: <Uint32Array>bufferData[primitive.indices].data
  };

  return {
    mesh,
    transform
  };
};

export class MiniRenderer {
  scene: Scene;

  private projectionMatrix: M4;

  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private positionLocation: number;
  private normalLocation: number;
  private worldViewProjectionLocation: WebGLUniformLocation;
  private worldInverseTransposeLocation: WebGLUniformLocation;
  private lightCountLocation: WebGLUniformLocation;

  constructor(canvas: HTMLCanvasElement) {
    [this.gl, this.program] = glInitializeProgram(canvas);

    this.scene = constructEmptyScene(this.gl.canvas.width, this.gl.canvas.height);

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(.9, .9, .9, 1.0);
    // eslint-disable-next-line no-bitwise
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.useProgram(this.program);

    this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.normalLocation = this.gl.getAttribLocation(this.program, 'a_normal');
    this.worldViewProjectionLocation = <WebGLUniformLocation>this.gl.getUniformLocation(this.program, 'u_worldViewProjection');
    this.worldInverseTransposeLocation = <WebGLUniformLocation>this.gl.getUniformLocation(this.program, 'u_worldInverseTranspose');
    this.lightCountLocation = <WebGLUniformLocation>this.gl.getUniformLocation(this.program, 'u_lightCount');

    this.refreshCamera();
    this.refreshLights();
  }

  updateViewportSize() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.render();
  }

  loadModel(bufferData: GLB.BufferData[], jsonData: GLB.JSONData) {
    this.scene.entity = entityFromGLB(bufferData, jsonData);
  }

  render() {
    // eslint-disable-next-line no-bitwise
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // TODO: if indices buffer doesn't exist, then use drawArrays
    this.gl.drawElements(this.gl.TRIANGLES, this.scene.entity.mesh.indices.length, this.gl.UNSIGNED_INT, 0);
  }

  refreshCamera() {
    this.projectionMatrix = M4.mult(this.scene.camera.projection, M4.inverse(this.scene.camera.transform));
  }

  refreshLights() {
    this.gl.uniform1i(this.lightCountLocation, this.scene.directionLights.length);
    this.scene.directionLights.forEach((dirLight, idx) => {
      this.gl.uniform3fv(
        this.gl.getUniformLocation(this.program, `u_lightSources[${idx}].reverseDirection`),
        V3.normalize(V3.scale(dirLight.direction, -1))
      );
      this.gl.uniform4fv(
        this.gl.getUniformLocation(this.program, `u_lightSources[${idx}].color`),
        dirLight.color
      );
    });
  }

  refreshEntity() {
    if (!this.scene.entity) { return; }

    const vertexArr = this.gl.createVertexArray();
    this.gl.bindVertexArray(vertexArr);
    bufferPositions(this.gl, this.positionLocation, this.scene.entity.mesh.positions);
    bufferNormals(this.gl, this.normalLocation, this.scene.entity.mesh.normals);
    bufferIndices(this.gl, this.scene.entity.mesh.indices);

    this.gl.uniformMatrix4fv(this.worldViewProjectionLocation, false, M4.mult(this.projectionMatrix, this.scene.entity.transform));
    this.gl.uniformMatrix4fv(this.worldInverseTransposeLocation, false, M4.transpose(M4.inverse(this.scene.entity.transform)));
  }
}
