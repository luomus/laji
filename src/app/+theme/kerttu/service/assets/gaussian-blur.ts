
/**
 * Originally from here: http://blog.ivank.net/fastest-gaussian-blur.html
 *
 * Modified to support non-integer data
 *
 * Fastest Gaussian Blur (in linear time)
 *
 * Copyright (c) 2014 Ivan Kutskir
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export const gaussBlur_4 = function(scl, tcl, w, h, r) {
  const bxs = boxesForGauss(r, 3);
  boxBlur_4 (scl, tcl, w, h, (bxs[0] - 1) / 2);
  boxBlur_4 (tcl, scl, w, h, (bxs[1] - 1) / 2);
  boxBlur_4 (scl, tcl, w, h, (bxs[2] - 1) / 2);
};

function boxesForGauss(sigma, n) {
  const wIdeal = Math.sqrt((12 * sigma * sigma / n) + 1);  // Ideal averaging filter width
  let wl = Math.floor(wIdeal);  if (wl % 2 === 0) { wl--; }
  const wu = wl + 2;

  const mIdeal = (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4);
  const m = Math.round(mIdeal);
  // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );

  const sizes = [];  for (let i = 0; i < n; i++) { sizes.push(i < m ? wl : wu); }
  return sizes;
}
function boxBlur_4 (scl, tcl, w, h, r) {
  for (let i = 0; i < scl.length; i++) { tcl[i] = scl[i]; }
  boxBlurH_4(tcl, scl, w, h, r);
  boxBlurT_4(scl, tcl, w, h, r);
}
function boxBlurH_4 (scl, tcl, w, h, r) {
  const iarr = 1 / (r + r + 1);
  for (let i = 0; i < h; i++) {
    let ti = i * w, li = ti, ri = ti + r;
    const fv = scl[ti], lv = scl[ti + w - 1];
    let val = (r + 1) * fv;
    for (let j = 0; j < r; j++) { val += scl[ti + j]; }
    for (let j = 0  ; j <= r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = val * iarr; }
    for (let j = r + 1; j < w - r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = val * iarr; }
    for (let j = w - r; j < w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = val * iarr; }
  }
}
function boxBlurT_4 (scl, tcl, w, h, r) {
  const iarr = 1 / (r + r + 1);
  for (let i = 0; i < w; i++) {
    let ti = i, li = ti, ri = ti + r * w;
    const fv = scl[ti], lv = scl[ti + w * (h - 1)];
    let val = (r + 1) * fv;
    for (let j = 0; j < r; j++) { val += scl[ti + j * w]; }
    for (let j = 0  ; j <= r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = val * iarr;  ri += w; ti += w; }
    for (let j = r + 1; j < h - r; j++) { val += scl[ri] - scl[li];  tcl[ti] = val * iarr;  li += w; ri += w; ti += w; }
    for (let j = h - r; j < h  ; j++) { val += lv      - scl[li];  tcl[ti] = val * iarr;  li += w; ti += w; }
  }
}
