import {Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild} from '@angular/core';
import { FFT, resample } from './FFT';

@Component({
  selector: 'laji-audio-spectrogram',
  templateUrl: './audio-spectrogram.component.html',
  styleUrls: ['./audio-spectrogram.component.scss']
})
export class AudioSpectrogramComponent implements OnChanges {
  @ViewChild('spectrogram', {static: true}) spectrogramRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('scrollLine', {static: true}) scrollLineRef: ElementRef<HTMLCanvasElement>;

  @Input() buffer: AudioBuffer;
  @Input() colormap: any;
  @Input() nperseg = 512;
  @Input() noverlap = 256;
  @Input() currentTime: number;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.buffer && this.colormap) {
      if ((changes.buffer || changes.colormap)) {
        const spectrogram = this.computeSpectrogram(this.buffer, this.nperseg, this.noverlap);
        this.displaySpectrogram(spectrogram);
      }

      if (changes.currentTime) {
        this.drawScrollLine();
      }
    }
  }

  private computeSpectrogram(buffer: AudioBuffer, nperseg: number, noverlap: number): Uint8Array[] {
    const fft = new FFT(nperseg, buffer.sampleRate, 'hann');
    const chanData = buffer.getChannelData(0);

    const spectrogram = [];
    let offset = 0;

    while (offset + nperseg < chanData.length) {
      const segment = chanData.slice(
        offset,
        offset + nperseg
      );
      const spectrum = fft.calculateSpectrum(segment);
      const spectrogramColumn = new Uint8Array(nperseg / 2);
      for (let j = 0; j < nperseg / 2; j++) {
        spectrogramColumn[j] = Math.max(-255, Math.log10(spectrum[j]) * 45);
      }
      spectrogram.push(spectrogramColumn);
      offset += nperseg - noverlap;
    }

    return spectrogram;
  }

  private displaySpectrogram(spectrogram: Uint8Array[]) {
    spectrogram = resample(spectrogram, spectrogram.length / 2);

    const canvas = this.spectrogramRef.nativeElement;
    const scrollLineCanvas = this.scrollLineRef.nativeElement;
    for (const canv of [canvas, scrollLineCanvas]) {
      canv.width = spectrogram.length;
      canv.height = spectrogram[0].length;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < spectrogram.length; i++) {
      for (let j = 0; j < spectrogram[i].length; j++) {
        const colormap = this.colormap[spectrogram[i][j]];
        ctx.fillStyle =
          'rgba(' +
          colormap[0] * 256 +
          ', ' +
          colormap[1] * 256 +
          ', ' +
          colormap[2] * 256 +
          ',' +
          colormap[3] +
          ')';
        ctx.fillRect(i, spectrogram[i].length - 1 - j, 1, 1);
      }
    }

    this.drawScrollLine();
  }

  private drawScrollLine() {
    const canvas = this.scrollLineRef.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const position = (this.currentTime / this.buffer.duration) * canvas.width;

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();
  }

  private clearCanvases() {
    for (const canvas of [this.spectrogramRef.nativeElement, this.scrollLineRef.nativeElement]) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}
