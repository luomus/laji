import { fragmentShader, vertexShader } from './shaders';

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

export const bufferPositions = (gl: WebGL2RenderingContext, positionsLocation: number, positions: Float32Array) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
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
};

export const bufferNormals = (gl: WebGL2RenderingContext, normalsLocation: number, normals: Float32Array) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
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
};

export const bufferIndices = (gl: WebGL2RenderingContext, indices: Uint32Array) => {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
};

export const bufferTexCoords = (gl: WebGL2RenderingContext, texCoordLocation: number, texCoords: number[]) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(
    texCoordLocation,
    2,
    gl.FLOAT,
    true,
    0,
    0
  );
};

export const setTexture = (gl: WebGL2RenderingContext, textureLocation: WebGLUniformLocation, image: any) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
};
