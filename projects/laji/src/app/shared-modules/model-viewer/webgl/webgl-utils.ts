import { fragmentShader, vertexShader } from './shaders';

export const getGlTypeFromArr = (gl: WebGLRenderingContext, arr: Uint16Array | Uint32Array) => (
  { 2: gl.UNSIGNED_SHORT, 4: gl.UNSIGNED_INT }[arr.BYTES_PER_ELEMENT]
);

export const createShader = (gl: WebGLRenderingContext, source: string, type: number): WebGLShader => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    throw new Error('could not compile shader:' + gl.getShaderInfoLog(shader));
  }
  return shader;
};

export const createProgram = (gl: WebGLRenderingContext, vertex: WebGLShader, fragment: WebGLShader): WebGLProgram => {
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
      throw new Error('program failed to link:' + gl.getProgramInfoLog (program));
  }
  return program;
};

export const glInitializeProgram = (canvas: HTMLCanvasElement): [WebGL2RenderingContext, WebGLProgram] => {
  const gl: WebGL2RenderingContext = canvas.getContext('webgl2');

  // compile shader program
  const vs = createShader(gl, vertexShader, gl.VERTEX_SHADER);
  const fs = createShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
  const program = createProgram(gl, vs, fs);

  return [gl, program];
};

export const bufferPositions = (gl: WebGL2RenderingContext, positionsLocation: number, positions: Float32Array, bufferRef: WebGLBuffer | void): WebGLBuffer => {
  const ref = bufferRef === null ? gl.createBuffer() : <WebGLBuffer>bufferRef;
  gl.bindBuffer(gl.ARRAY_BUFFER, ref);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionsLocation);
  gl.vertexAttribPointer(
    positionsLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  return ref;
};

export const bufferNormals = (gl: WebGL2RenderingContext, normalsLocation: number, normals: Float32Array, bufferRef: WebGLBuffer | void): WebGLBuffer => {
  const ref = bufferRef === null ? gl.createBuffer() : <WebGLBuffer>bufferRef;
  gl.bindBuffer(gl.ARRAY_BUFFER, ref);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalsLocation);
  gl.vertexAttribPointer(
    normalsLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  return ref;
};

export const bufferIndices = (gl: WebGL2RenderingContext, indices: Uint32Array | Uint16Array, bufferRef: WebGLBuffer | void): WebGLBuffer => {
  const ref = bufferRef === null ? gl.createBuffer() : <WebGLBuffer>bufferRef;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ref);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  return ref;
};
