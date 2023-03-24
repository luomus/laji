import { M4, V3, V4 } from './math-3d';
import { createShader, createProgram, bufferPositions, bufferNormals, bufferTexCoords, setTexture, bufferIndices } from './webgl-utils';
import { fragmentShader, vertexShader } from './shaders';
import { GLB } from './glb-parser';

interface Camera {
  transform: M4;
  projection: M4;
}

interface LightSource {
  direction: V3;
  color: V4;
}

interface Drawable {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

export const glLoadModel = (renderer: GLRenderer, bufferData: GLB.BufferData[], jsonData: GLB.JSONData) => {
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
  const T2 = M4.translation(0, -200, -1500);
  const R2 = M4.yRotation(-Math.PI / 4);
  const S2 = M4.scaling(25, 25, 25);
  const transform = M4.mult(
    T2, M4.mult(
      R2, M4.mult(
        S2, nodeTransform
      )
    )
  );

  // only supports a single mesh and primitive atm
  const primitive = jsonData.meshes[0].primitives[0];

  renderer.drawable = {
    positions: <Float32Array>bufferData[primitive.attributes.POSITION].data,
    normals: <Float32Array>bufferData[primitive.attributes.NORMAL].data,
    indices: <Uint32Array>bufferData[primitive.indices].data
  };

  renderer.transform = transform;
};

const glInitializeProgram = (canvas: HTMLCanvasElement): [WebGL2RenderingContext, WebGLProgram] => {
  const gl: WebGL2RenderingContext = canvas.getContext('webgl2');

  // compile shader program
  const vs = createShader(gl, vertexShader, gl.VERTEX_SHADER);
  const fs = createShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
  const program = createProgram(gl, vs, fs);

  return [gl, program];
};

export class GLRenderer {
  private _camera: Camera = {projection: undefined, transform: undefined};
  get camera() {
    return this._camera;
  }
  set camera(c: Camera) {
    this._camera = c;
    this.dirty['camera'] = true;
  }
  private _lightSources: LightSource[] = [];
  get lightSources() {
    return this._lightSources;
  }
  set lightSources(l: LightSource[]) {
    this._lightSources = l;
    this.dirty['lightSources'] = true;
  }
  private _drawable: Drawable;
  get drawable() {
    return this._drawable;
  }
  set drawable(d: Drawable) {
    this._drawable = d;
    this.dirty['drawable'] = true;
  }

  transform: M4 = M4.unit();

  private dirty = {
    camera: true,
    lightSources: true,
    drawable: true
  };

  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private positionLocation: number;
  private normalLocation: number;
  private worldViewProjectionLocation: WebGLUniformLocation;
  private worldInverseTransposeLocation: WebGLUniformLocation;
  private lightCountLocation: WebGLUniformLocation;

  private projectionMatrix = M4.unit();

  constructor(canvas: HTMLCanvasElement) {
    [this.gl, this.program] = glInitializeProgram(canvas);

    // set up default camera and lighting
    this.camera = {
      transform: M4.unit(),
      projection: M4.perspective(
        Math.PI / 2,
        this.gl.canvas.width / this.gl.canvas.height,
        1,
        4000
      )
    };
    this.lightSources = [
      {
        direction: [-0.5, -0.7, -1],
        color: [0.2, 1, 0.2, 1]
      }
    ];

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(.9, .9, .9, 1.0);
    // eslint-disable-next-line no-bitwise
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.useProgram(this.program);

    this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.normalLocation = this.gl.getAttribLocation(this.program, 'a_normal');
    this.worldViewProjectionLocation = this.gl.getUniformLocation(this.program, 'u_worldViewProjection');
    this.worldInverseTransposeLocation = this.gl.getUniformLocation(this.program, 'u_worldInverseTranspose');
    this.lightCountLocation = this.gl.getUniformLocation(this.program, 'u_lightCount');
  }

  render() {
    // eslint-disable-next-line no-bitwise
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (this.dirty['camera']) {
      this.projectionMatrix = M4.mult(this.camera.projection, M4.inverse(this.camera.transform));
      this.dirty['camera'] = false;
    }

    if (this.dirty['lightSources']) {
      this.gl.uniform1i(this.lightCountLocation, this.lightSources.length);
      this.lightSources.forEach((lightSource, idx) => {
        this.gl.uniform3fv(
          this.gl.getUniformLocation(this.program, `u_lightSources[${idx}].reverseDirection`),
          V3.normalize(V3.scale(lightSource.direction, -1))
        );
        this.gl.uniform4fv(
          this.gl.getUniformLocation(this.program, `u_lightSources[${idx}].color`),
          lightSource.color
        );
      });
      this.dirty['lightSources'] = false;
    }

    if (!this.drawable) { return; }

    if (this.dirty['drawable']) {
      const vertexArr = this.gl.createVertexArray();
      this.gl.bindVertexArray(vertexArr);
      bufferPositions(this.gl, this.positionLocation, this.drawable.positions);
      bufferNormals(this.gl, this.normalLocation, this.drawable.normals);
      bufferIndices(this.gl, this.drawable.indices);
      this.dirty['drawable'] = false;
    }

    this.gl.uniformMatrix4fv(this.worldViewProjectionLocation, false, M4.mult(this.projectionMatrix, this.transform));
    this.gl.uniformMatrix4fv(this.worldInverseTransposeLocation, false, M4.transpose(M4.inverse(this.transform)));

    // TODO: if indices buffer doesn't exist, then use drawArrays
    this.gl.drawElements(this.gl.TRIANGLES, this.drawable.indices.length, this.gl.UNSIGNED_INT, 0);
  }
}
