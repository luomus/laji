/**
 * Originally from here: https://github.com/katspaugh/wavesurfer.js/blob/master/src/plugin/spectrogram.js
 *
 * Modified to fit our coding style rules
 *
 * Original license:
 * BSD 3-Clause License
 *
 * Copyright (c) 2012-2020, katspaugh and contributors
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * Neither the name of the copyright holder nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

type windowFunction = 'bartlett'|'bartlettHann'|'blackman'|'cosine'|'gauss'|'hamming'|'hann'|'lanczoz'|'rectangular'|'triangular';

/* tslint:disable:no-bitwise */
export const FFT = function(bufferSize: number, sampleRate: number, windowFunc: windowFunction, alpha: number = undefined) {
  this.bufferSize = bufferSize;
  this.sampleRate = sampleRate;
  this.bandwidth = (2 / bufferSize) * (sampleRate / 2);

  this.sinTable = new Float32Array(bufferSize);
  this.cosTable = new Float32Array(bufferSize);
  this.windowValues = new Float32Array(bufferSize);
  this.reverseTable = new Uint32Array(bufferSize);

  this.peakBand = 0;
  this.peak = 0;

  switch (windowFunc) {
    case 'bartlett':
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] =
          (2 / (bufferSize - 1)) *
          ((bufferSize - 1) / 2 - Math.abs(i - (bufferSize - 1) / 2));
      }
      break;
    case 'bartlettHann':
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] =
          0.62 -
          0.48 * Math.abs(i / (bufferSize - 1) - 0.5) -
          0.38 * Math.cos((Math.PI * 2 * i) / (bufferSize - 1));
      }
      break;
    case 'blackman':
      alpha = alpha || 0.16;
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] =
          (1 - alpha) / 2 -
          0.5 * Math.cos((Math.PI * 2 * i) / (bufferSize - 1)) +
          (alpha / 2) *
          Math.cos((4 * Math.PI * i) / (bufferSize - 1));
      }
      break;
    case 'cosine':
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] = Math.cos(
          (Math.PI * i) / (bufferSize - 1) - Math.PI / 2
        );
      }
      break;
    case 'gauss':
      alpha = alpha || 0.25;
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] = Math.pow(
          Math.E,
          -0.5 *
          Math.pow(
            (i - (bufferSize - 1) / 2) /
            ((alpha * (bufferSize - 1)) / 2),
            2
          )
        );
      }
      break;
    case 'hamming':
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] =
          (0.54 - 0.46) *
          Math.cos((Math.PI * 2 * i) / (bufferSize - 1));
      }
      break;
    case 'hann':
    case undefined:
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] =
          0.5 * (1 - Math.cos((Math.PI * 2 * i) / (bufferSize - 1)));
      }
      break;
    case 'lanczoz':
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] =
          Math.sin(Math.PI * ((2 * i) / (bufferSize - 1) - 1)) /
          (Math.PI * ((2 * i) / (bufferSize - 1) - 1));
      }
      break;
    case 'rectangular':
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] = 1;
      }
      break;
    case 'triangular':
      for (let i = 0; i < bufferSize; i++) {
        this.windowValues[i] =
          (2 / bufferSize) *
          (bufferSize / 2 - Math.abs(i - (bufferSize - 1) / 2));
      }
      break;
    default:
      throw Error('No such window function "' + windowFunc + '"');
  }

  let limit = 1;
  let bit = bufferSize >> 1;

  while (limit < bufferSize) {
    for (let i = 0; i < limit; i++) {
      this.reverseTable[i + limit] = this.reverseTable[i] + bit;
    }

    limit = limit << 1;
    bit = bit >> 1;
  }

  for (let i = 0; i < bufferSize; i++) {
    this.sinTable[i] = Math.sin(-Math.PI / i);
    this.cosTable[i] = Math.cos(-Math.PI / i);
  }

  this.calculateSpectrum = function(buffer) {
    // Locally scope variables for speed up
    bufferSize = this.bufferSize;
    const cosTable = this.cosTable,
      sinTable = this.sinTable,
      reverseTable = this.reverseTable,
      real = new Float32Array(bufferSize),
      imag = new Float32Array(bufferSize),
      bSi = 2 / this.bufferSize,
      sqrt = Math.sqrt,
      spectrum = new Float32Array(bufferSize / 2);

    let rval,
      ival,
      mag;

    const k = Math.floor(Math.log(bufferSize) / Math.LN2);

    if (Math.pow(2, k) !== bufferSize) {
      throw Error('Invalid buffer size, must be a power of 2.');
    }
    if (bufferSize !== buffer.length) {
      throw Error(
        'Supplied buffer is not the same size as defined FFT. FFT Size: ' +
        bufferSize +
        ' Buffer Size: ' +
        buffer.length
      );
    }

    let halfSize = 1,
      phaseShiftStepReal,
      phaseShiftStepImag,
      currentPhaseShiftReal,
      currentPhaseShiftImag,
      off,
      tr,
      ti,
      tmpReal;

    for (let i = 0; i < bufferSize; i++) {
      real[i] =
        buffer[reverseTable[i]] * this.windowValues[reverseTable[i]];
      imag[i] = 0;
    }

    while (halfSize < bufferSize) {
      phaseShiftStepReal = cosTable[halfSize];
      phaseShiftStepImag = sinTable[halfSize];

      currentPhaseShiftReal = 1;
      currentPhaseShiftImag = 0;

      for (let fftStep = 0; fftStep < halfSize; fftStep++) {
        let i = fftStep;

        while (i < bufferSize) {
          off = i + halfSize;
          tr =
            currentPhaseShiftReal * real[off] -
            currentPhaseShiftImag * imag[off];
          ti =
            currentPhaseShiftReal * imag[off] +
            currentPhaseShiftImag * real[off];

          real[off] = real[i] - tr;
          imag[off] = imag[i] - ti;
          real[i] += tr;
          imag[i] += ti;

          i += halfSize << 1;
        }

        tmpReal = currentPhaseShiftReal;
        currentPhaseShiftReal =
          tmpReal * phaseShiftStepReal -
          currentPhaseShiftImag * phaseShiftStepImag;
        currentPhaseShiftImag =
          tmpReal * phaseShiftStepImag +
          currentPhaseShiftImag * phaseShiftStepReal;
      }

      halfSize = halfSize << 1;
    }

    for (let i = 0, N = bufferSize / 2; i < N; i++) {
      rval = real[i];
      ival = imag[i];
      mag = bSi * sqrt(rval * rval + ival * ival);

      if (mag > this.peak) {
        this.peakBand = i;
        this.peak = mag;
      }
      spectrum[i] = mag;
    }
    return spectrum;
  };
};
/* tslint:enable:no-bitwise */
