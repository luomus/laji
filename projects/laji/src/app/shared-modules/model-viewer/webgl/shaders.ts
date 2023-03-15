// for syntax highlighting of glsl literals
// vscode glsl-literal plugin
const glsl = x => x;

export const vertexShader =
glsl`#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
in vec3 a_normal;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

out vec2 v_texcoord;
out vec3 v_normal;
void main() {
  gl_Position = u_worldViewProjection * a_position;
  v_texcoord = a_texcoord;
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
}`;

export const fragmentShader =
glsl`#version 300 es
#define MAX_NUM_TOTAL_LIGHTS 1

precision mediump float;

struct LightSource {
  vec3 reverseDirection;
  vec4 color;
};

in vec3 v_normal;
in vec2 v_texcoord;

uniform int u_lightCount;
uniform LightSource u_lightSources[MAX_NUM_TOTAL_LIGHTS];

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  vec3 normal = normalize(v_normal);
  // outColor = texture(u_texture, v_texcoord);
  outColor = vec4(.5,.5,.5,1);
  for (int i = 0; i < u_lightCount; i++) {
    float light = dot(normal, u_lightSources[i].reverseDirection);
    outColor.rgb *= light;
  }
}`;
