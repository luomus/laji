import { M4, V3, V4 } from './math-3d';
import { createShader, createProgram, bufferPositions, bufferNormals, bufferTexCoords, setTexture } from './webgl-utils';
import { parseObj } from './obj-parser';
import { testModel } from './test-model';
import { fragmentShader, vertexShader } from './shaders';

interface Camera {
  transform: M4;
  projection: M4;
}

interface LightSource {
  direction: V3;
  color: V4;
}

interface Drawable {
  verts: number[];
  texCoords?: number[];
  texture?: any;
  normals: number[];
  transform: M4;
}

export const glLoadModel = (renderer: GLRenderer) => {
  // load the model
  const obj: string = testModel;
  const model = parseObj(obj);

  // set up the models transform
  let transform = M4.translation(0, -200, -1500);
  transform = M4.mult(transform, M4.yRotation(-Math.PI / 4));
  transform = M4.mult(transform, M4.scaling(200, 200, 200));

  // add the model to the renderer
  renderer.drawables = [
    {
      verts: model.triangles,
      normals: model.normals,
      transform
    }
  ];
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
  private _drawables: Drawable[] = [];
  get drawables() {
    return this._drawables;
  }
  set drawables(d: Drawable[]) {
    this._drawables = d;
    this.dirty['drawables'] = true;
  }

  private dirty = {
    camera: true,
    lightSources: true,
    drawables: true
  };

  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private positionLocation: number;
  private texCoordLocation: number;
  private normalLocation: number;
  private worldViewProjectionLocation: WebGLUniformLocation;
  private worldInverseTransposeLocation: WebGLUniformLocation;
  private lightCountLocation: WebGLUniformLocation;
  private textureLocation: WebGLUniformLocation;

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
        2000
      )
    };
    this.lightSources = [
      {
        direction: [-0.5, -0.7, -1],
        color: [0.2, 1, 0.2, 1]
      }
    ];

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(.2, .2, .2, 1.0);
    // eslint-disable-next-line no-bitwise
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.useProgram(this.program);

    this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texcoord');
    this.normalLocation = this.gl.getAttribLocation(this.program, 'a_normal');
    this.worldViewProjectionLocation = this.gl.getUniformLocation(this.program, 'u_worldViewProjection');
    this.worldInverseTransposeLocation = this.gl.getUniformLocation(this.program, 'u_worldInverseTranspose');
    this.lightCountLocation = this.gl.getUniformLocation(this.program, 'u_lightCount');
    this.textureLocation = this.gl.getUniformLocation(this.program, 'u_texture');
  }

  render() {
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

    if (this.dirty['drawables']) {
      const vertexArr = this.gl.createVertexArray();
      this.gl.bindVertexArray(vertexArr);
      bufferPositions(this.gl, this.positionLocation, this.drawables.reduce((acc, curr) => acc.concat(curr.verts), []));
      bufferNormals(this.gl, this.normalLocation, this.drawables.reduce((acc, curr) => acc.concat(curr.normals), []));
      bufferTexCoords(this.gl, this.texCoordLocation, this.drawables.reduce((acc, curr) => acc.concat(curr.texCoords), []));
      this.dirty['drawables'] = false;
    }

    let offset = 0;
    this.drawables.forEach(drawable => {
      this.gl.uniformMatrix4fv(this.worldViewProjectionLocation, false, M4.mult(this.projectionMatrix, drawable.transform));
      this.gl.uniformMatrix4fv(this.worldInverseTransposeLocation, false, M4.transpose(M4.inverse(drawable.transform)));
      if (drawable.texture) {
        setTexture(this.gl, this.textureLocation, drawable.texture);
      }
      this.gl.drawArrays(this.gl.TRIANGLES, offset / 3, drawable.verts.length);
      offset += drawable.verts.length;
    });
  }
}
