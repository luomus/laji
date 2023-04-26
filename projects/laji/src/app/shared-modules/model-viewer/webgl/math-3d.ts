export type V2 = [number, number];
export type V3 = [number, number, number];
export type V4 = [number, number, number, number];

export type M3 = [
  number, number, number,
  number, number, number,
  number, number, number
];
export type M4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export const V3 = {
  normalize: (v: V3): V3 => {
    const length = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return length > 0 ? [
      v[0] / length, v[1] / length, v[2] / length
    ] : [0, 0, 0];
  },
  scale: (v: V3, s: number): V3 => [
    v[0] * s,
    v[1] * s,
    v[2] * s
  ],
  add: (a: V3, b: V3): V3 => [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2]
  ],
  sub: (a: V3, b: V3): V3 => [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2]
  ],
  cross: (a: V3, b: V3): V3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ]
};

export const M4 = {
  unit: (): M4 => [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ],
  extractBasis: (m: M4): [V3, V3, V3] => [
    [m[0], m[1], m[2]],
    [m[4], m[5], m[6]],
    [m[8], m[9], m[10]]
  ],
  extractTranslation: (m: M4): V3 => [
    m[12], m[13], m[14]
  ],
  add: (a: M4, b: M4) => {},
  scale: (s: M4) => {},
  mult: (a: M4, b: M4): M4 => {
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];

    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },
  multv: (m: M4, v: V3 | V4): V4 => {
    const v2: V4 = v.length === 4 ? v : [...v, 0];
    return [
      v2[0]*m[0] + v2[1]*m[1] + v2[2]*m[2] + v2[3]*m[3],
      v2[0]*m[4] + v2[1]*m[5] + v2[2]*m[6] + v2[3]*m[7],
      v2[0]*m[8] + v2[1]*m[9] + v2[2]*m[10] + v2[3]*m[11],
      v2[0]*m[12] + v2[1]*m[13] + v2[2]*m[14] + v2[3]*m[15]
    ];
  },
  translation: (tx: number, ty: number, tz: number): M4 => [
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    tx, ty, tz, 1,
 ],
  xRotation: (radians: number): M4 => {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },
  yRotation: (radians: number): M4 => {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },
  zRotation: (radians: number): M4 => {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    return [
      c, s, 0, 0,
     -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
   ];
  },
  // "Rodrigues' rotation formula": http://www.songho.ca/opengl/gl_rotate.html
  rotation: (axis: V3, θ: number): M4 => {
    const [x, y, z] = axis;
    const c = Math.cos(θ);
    const s = Math.sin(θ);
    const x2 = Math.pow(x,2);
    const y2 = Math.pow(y,2);
    const z2 = Math.pow(z,2);
    return [
      (1-c)*x2+c,    (1-c)*x*y-s*z, (1-c)*x*z+s*y, 0,
      (1-c)*x*y+s*z, (1-c)*y2+c,    (1-c)*y*z-s*x, 0,
      (1-c)*x*z-s*y, (1-c)*y*z+s*x, (1-c)*z2+c,    0,
      0,             0,             0,             1
    ];
  },
  rotationFromQuaternion: (qx: number, qy: number, qz: number, qw: number): M4 => ([
    1 - 2*qy*qy - 2*qz*qz, 2*qx*qy + 2*qz*qw,     2*qx*qz - 2*qy*qw,     0,
    2*qx*qy - 2*qz*qw,     1 - 2*qx*qx - 2*qz*qz, 2*qy*qz + 2*qx*qw,     0,
    2*qx*qz + 2*qy*qw,     2*qy*qz - 2*qx*qw,     1 - 2*qx*qx - 2*qy*qy, 0,
    0,                     0,                     0,                     1
  ]),
  scaling: (sx: number, sy: number, sz: number): M4 => [
    sx, 0,  0,  0,
    0, sy,  0,  0,
    0,  0, sz,  0,
    0,  0,  0,  1,
  ],
  perspective: (radians: number, aspect: number, near: number, far: number): M4 => {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * radians);
    const rangeInv = 1.0 / (near - far);
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  },
  inverse: (m: M4): M4 => {
    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m03 = m[0 * 4 + 3];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m13 = m[1 * 4 + 3];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];
    const m23 = m[2 * 4 + 3];
    const m30 = m[3 * 4 + 0];
    const m31 = m[3 * 4 + 1];
    const m32 = m[3 * 4 + 2];
    const m33 = m[3 * 4 + 3];
    const tmp0  = m22 * m33;
    const tmp1  = m32 * m23;
    const tmp2  = m12 * m33;
    const tmp3  = m32 * m13;
    const tmp4  = m12 * m23;
    const tmp5  = m22 * m13;
    const tmp6  = m02 * m33;
    const tmp7  = m32 * m03;
    const tmp8  = m02 * m23;
    const tmp9  = m22 * m03;
    const tmp10 = m02 * m13;
    const tmp11 = m12 * m03;
    const tmp12 = m20 * m31;
    const tmp13 = m30 * m21;
    const tmp14 = m10 * m31;
    const tmp15 = m30 * m11;
    const tmp16 = m10 * m21;
    const tmp17 = m20 * m11;
    const tmp18 = m00 * m31;
    const tmp19 = m30 * m01;
    const tmp20 = m00 * m21;
    const tmp21 = m20 * m01;
    const tmp22 = m00 * m11;
    const tmp23 = m10 * m01;

    const t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
             (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
    const t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
             (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
    const t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
             (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
    const t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
             (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);

    const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) -
           (tmp0 * m10 + tmp3 * m20 + tmp4 * m30)),
      d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) -
           (tmp1 * m00 + tmp6 * m20 + tmp9 * m30)),
      d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) -
           (tmp2 * m00 + tmp7 * m10 + tmp10 * m30)),
      d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) -
           (tmp5 * m00 + tmp8 * m10 + tmp11 * m20)),
      d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) -
           (tmp13 * m13 + tmp14 * m23 + tmp17 * m33)),
      d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) -
           (tmp12 * m03 + tmp19 * m23 + tmp20 * m33)),
      d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) -
           (tmp15 * m03 + tmp18 * m13 + tmp23 * m33)),
      d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) -
           (tmp16 * m03 + tmp21 * m13 + tmp22 * m23)),
      d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) -
           (tmp16 * m32 + tmp12 * m12 + tmp15 * m22)),
      d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) -
           (tmp18 * m22 + tmp21 * m32 + tmp13 * m02)),
      d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) -
           (tmp22 * m32 + tmp14 * m02 + tmp19 * m12)),
      d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) -
           (tmp20 * m12 + tmp23 * m22 + tmp17 * m02)),
    ];
  },
  transpose: (m: M4): M4 => [
    m[0], m[4], m[8], m[12],
    m[1], m[5], m[9], m[13],
    m[2], m[6], m[10], m[14],
    m[3], m[7], m[11], m[15],
  ]
};
