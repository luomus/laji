/* eslint-disable no-bitwise */
export namespace GLB {
  interface Header {
    magic: number;
    version: 2;
    dataLength: number; // length in bytes of the entire file
  }

  type BufferType = 'VEC3' | 'SCALAR';

  export interface JSONData {
    nodes: any;
    materials: any;
    meshes: any;
    accessors: [{
      bufferView: number; componentType: number; count: number;
      max: number[]; min: number[]; type: BufferType;
    }];
    bufferViews: [{ buffer: number; byteLength: number; byteOffset: number; target: number }];
    buffers: [{ byteLength: number }];
  }

  interface JSONChunk {
    chunkLength: number;
    chunkData: JSONData;
  }

  export interface BufferData {
    type: 'VEC3' | 'SCALAR';
    data: Float32Array | Uint32Array | Uint16Array;
    target: Target;
  }

  type Target = 'ARRAY_BUFFER' | 'ELEMENT_ARRAY_BUFFER';

  const readHeader = (d: DataView, offset: number): [Header, number] => {
    const magic = d.getUint32(offset, true);
    offset += 4;

    const version = d.getUint32(offset, true);
    offset += 4;

    const dataLength = d.getUint32(offset, true);
    offset += 4;

    if (magic.toString(16) !== '46546c67') {
      throw new Error(`Malformed GLB: Wrong magic: ${magic}`);
    }
    if (version !== 2) {
      throw new Error(`Malformed GLB: Filetype recognized, but only version 2 is supported. Was: ${version}`);
    }

    return [{ magic, version, dataLength }, offset];
  };

  const stringFromUint32 = (uint32: number) => String.fromCharCode(
    (uint32 >> 24) & 0xFF,
    (uint32 >> 16) & 0xFF,
    (uint32 >> 8)  & 0xFF,
     uint32        & 0xFF
  );

  const readJSONChunk = (d: DataView, offset: number): [JSONChunk, number] => {
    const chunkLength = d.getUint32(offset, true);
    offset += 4;

    const chunkTypeUint32 = d.getUint32(offset, false);
    const chunkType = stringFromUint32(chunkTypeUint32);
    offset += 4;

    if (chunkType !== 'JSON') {
      throw new Error(`Malformed GLB: expected a JSON chunk. Was: ${chunkType}`);
    }

    const arr: number[] = [];
    for (let byteIdx = offset; byteIdx < offset + chunkLength; byteIdx++) {
      arr.push(d.getUint8(byteIdx));
    }
    const data = JSON.parse(String.fromCharCode(...arr));

    offset += chunkLength;
    return [{ chunkLength, chunkData: data }, offset];
  };

  const readBinaryBuffer = (d: DataView, offset: number, bufferIdx: number, jsonData: JSONData): [BufferData[], number] => {
    const chunkLength = d.getUint32(offset, true);
    offset += 4;

    const chunkTypeUint32 = d.getUint32(offset, false);
    const chunkType = stringFromUint32(chunkTypeUint32);
    offset += 4;

    if (chunkType !== 'BIN\x00') {
      throw new Error(`Malformed GLB: expected a BIN chunk. Was: ${chunkType}`);
    }

    const bufferData: BufferData[] = [];
    let bufferByteOffset = 0; // for sanity check only

    for (let i = 0; i < jsonData.bufferViews.length; i++) {
      const bufferView = jsonData.bufferViews[i];
      if (bufferView.buffer !== bufferIdx) { continue; }
      const accessor = jsonData.accessors.find(a => a.bufferView === i);
      if (!accessor) {
        throw new Error(`Malformed GLB: No accessor for bufferView ${i}.`);
      }

      // the following error may be caused by bufferViews being out of order in the json array
      // I'm not sure if the spec allows for this or not so I won't design the parser around it for the moment.
      console.assert(bufferByteOffset === bufferView.byteOffset, 'BufferView byteOffset mismatch.');

      /*
        Consume bufferView from the buffer
      */
      const arrConst = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array }[accessor.componentType];
      if (!arrConst) { throw new Error(`Unimplemented accessor.componentType: ${accessor.componentType}`); }
      const dataGetter = { 5126: d.getFloat32.bind(d), 5125: d.getUint32.bind(d), 5123: d.getUint16.bind(d) }[accessor.componentType];
      const dimension = { VEC3: 3, SCALAR: 1 }[accessor.type];
      if (!dimension) { throw new Error(`Unimplemented accessor.type: ${accessor.type}`); }
      /*
        Note: bufferView.target denotes ARRAY_BUFFER / ELEMENT_ARRAY_BUFFER upon webgl buffer binding
              we are not doing much with this for now, since positions and normals are always ARRAY_BUFFER
              and indices are always ELEMENT_ARRAY_BUFFER
      */
      const target = { 34962: <Target>'ARRAY_BUFFER', 34963: <Target>'ELEMENT_ARRAY_BUFFER' }[bufferView.target];

      const arr = new arrConst(bufferView.byteLength / arrConst.BYTES_PER_ELEMENT);
      let k = 0;
      for (let j = offset; j < offset + bufferView.byteLength; j += arrConst.BYTES_PER_ELEMENT) {
        arr[k] = dataGetter(j, true);
        k++;
      }
      bufferData.push({ type: accessor.type, data: arr, target });
      console.assert(arr.length / dimension === accessor.count, `Accessor count and buffer array length mismatch: ${arr.length/dimension} !== ${accessor.count}`);
      console.assert(arr.byteLength === bufferView.byteLength, `BufferView byteLength mismatch: ${arr.byteLength} !== ${bufferView.byteLength}`);

      offset += bufferView.byteLength;
      bufferByteOffset += bufferView.byteLength;
    }

    /*
      Note: byte length mismatch is caused by padding bytes and should be ignored
      https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_005_BuffersBufferViewsAccessors.md
    */
/*     const byteLength = bufferData.reduce((p, bd) => p += bd.data.byteLength, 0);
    const expectedByteLength = jsonData.buffers[bufferIdx].byteLength;
    console.warn(byteLength === expectedByteLength, `Buffer byteLength mismatch: ${byteLength} !== ${expectedByteLength}`); */

    return [bufferData, offset];
  };

  export const parseBlob = async (blob: Blob): Promise<[BufferData[][], JSONData]> => {
    const arrayBuffer = await blob.arrayBuffer();
    const d = new DataView(arrayBuffer);
    const [header, postHeaderOffset] = readHeader(d, 0);
    const [jsonChunk, postJsonOffset] = readJSONChunk(d, postHeaderOffset);
    let offset = postJsonOffset;
    let i = 0;
    const bufferData: BufferData[][] = [];
    while (offset < header.dataLength && jsonChunk.chunkData.buffers[i] !== undefined) {
      const [bd, o] = readBinaryBuffer(d, offset, i, jsonChunk.chunkData);
      offset = o;
      bufferData.push(bd);
      i++;
    }
/*  As before, the bytelength mismatch is caused by padding bytes and should be ignored
    console.assert(header.dataLength === offset, `Header byteLength mismatch with actual byteLength: ${header.dataLength} !== ${offset}`); */

    return [bufferData, jsonChunk.chunkData];
  };
}
