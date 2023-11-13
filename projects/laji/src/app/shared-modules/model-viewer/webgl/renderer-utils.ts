import { M4, V3 } from './math-3d';

export const rotateObjectRelativeToViewport = (c: M4, o: M4, θ: number, φ: number): M4 => {
  const cBasis = M4.extractBasis(c);
  const vertical: V3 = V3.normalize(cBasis[1]);
  const horizontal: V3 = V3.normalize(cBasis[0]);
  const vo = V3.normalize(<V3>M4.multv(o, vertical).slice(0,3));
  const ho = V3.normalize(<V3>M4.multv(o, horizontal).slice(0,3));
  return M4.mult(M4.mult(o, M4.rotation(ho, -θ)), M4.rotation(vo, -φ));
};
