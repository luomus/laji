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

export const bufferPositions = (gl: WebGL2RenderingContext, positionLocation: number, positions: number[]) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(
    positionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
};

export const bufferNormals = (gl: WebGL2RenderingContext, normalLocation: number, normals: number[]) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalLocation);
  gl.vertexAttribPointer(
    normalLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
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
