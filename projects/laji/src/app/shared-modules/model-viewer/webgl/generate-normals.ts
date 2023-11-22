import { V3 } from './math-3d';

const getSurfaceNormal = (ab: V3, ac: V3) => V3.normalize(V3.cross(ab, ac));

export const generateFlatVertexNormals = (positions: Float32Array, indices: Uint32Array | Uint16Array): Float32Array => {
  const normals = new Float32Array(positions.length);

  // for each triangle
  for (let i = 0; i < indices.length; i += 3) {
    // calculate the surface normal
    const aIdx = indices[i];
    const bIdx = indices[i+1];
    const cIdx = indices[i+2];
    const a: V3 = [positions[aIdx * 3], positions[aIdx * 3 + 1], positions[aIdx * 3 + 2]];
    const b: V3 = [positions[bIdx * 3], positions[bIdx * 3 + 1], positions[bIdx * 3 + 2]];
    const c: V3 = [positions[cIdx * 3], positions[cIdx * 3 + 1], positions[cIdx * 3 + 2]];
    const surfaceNormal = getSurfaceNormal(V3.sub(b, a), V3.sub(c, a));

    // update the vertex normal of each vertex of the triangle
    [aIdx, bIdx, cIdx].forEach(j => {
      normals[j*3]   += surfaceNormal[0];
      normals[j*3+1] += surfaceNormal[1];
      normals[j*3+2] += surfaceNormal[2];
    });
  }

  // normalize the normals!
  for (let i = 0; i < indices.length; i += 3) {
    const normalized = V3.normalize([normals[i], normals[i+1], normals[i+2]]);
    normals[i]   = normalized[0];
    normals[i+1] = normalized[1];
    normals[i+2] = normalized[2];
  }

  return normals;
};
