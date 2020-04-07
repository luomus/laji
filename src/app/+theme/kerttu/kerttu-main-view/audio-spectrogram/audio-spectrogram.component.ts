import {Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild} from '@angular/core';
import { FFT, resample } from './FFT';
import { axisBottom, axisLeft } from 'd3-axis';
import {select} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import { format } from 'd3-format';

@Component({
  selector: 'laji-audio-spectrogram',
  templateUrl: './audio-spectrogram.component.html',
  styleUrls: ['./audio-spectrogram.component.scss']
})
export class AudioSpectrogramComponent implements OnChanges {
  @ViewChild('container', {static: true}) containerRef: ElementRef<HTMLDivElement>;
  @ViewChild('spectrogram', {static: true}) spectrogramRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('axes', {static: true}) axesRef: ElementRef<SVGElement>;
  @ViewChild('scrollLine', {static: true}) scrollLineRef: ElementRef<HTMLCanvasElement>;

  @Input() buffer: AudioBuffer;
  @Input() colormap: any;
  @Input() nperseg = 512;
  @Input() noverlap = 256;
  @Input() currentTime: number;

  @Input() xRange: number[];
  @Input() yRange: number[];

  private margin: { top: number, bottom: number, left: number, right: number} = { top: 10, bottom: 20, left: 30, right: 10};

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.buffer && this.colormap) {
      if ((changes.buffer || changes.colormap)) {
        const {spectrogram, maxFreq, maxTime} = this.computeSpectrogram(this.buffer, this.nperseg, this.noverlap);
        this.displaySpectrogram(spectrogram, maxFreq, maxTime);
      }

      if (changes.currentTime) {
        this.drawScrollLine();
      }
    }
  }

  private computeSpectrogram(buffer: AudioBuffer, nperseg: number, noverlap: number): {spectrogram: Uint8Array[], maxFreq: number, maxTime: number} {
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

    const maxFreq = Math.floor(buffer.sampleRate / 2);
    const maxTime = buffer.duration;

    return {spectrogram, maxFreq, maxTime};
  }

  private displaySpectrogram(spectrogram: Uint8Array[], maxFreq: number, maxTime: number) {
    // spectrogram = resample(spectrogram, spectrogram.length / 2);

    const canvas = this.spectrogramRef.nativeElement;
    const scrollLineCanvas = this.scrollLineRef.nativeElement;
    const axes = this.axesRef.nativeElement;
    const width = spectrogram.length;
    const height = spectrogram[0].length;

    for (const canv of [canvas, scrollLineCanvas]) {
      canv.width = width;
      canv.height = height;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

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

    this.drawAxis(width, height, maxFreq, maxTime);

    // this.drawScrollLine();
  }

  private drawAxis(width, height, maxFreq, maxTime) {
    /*
    const element = this.containerRef.nativeElement;
    const width = element.offsetWidth - (this.margin.left + this.margin.right);
    const height = element.offsetHeight - (this.margin.top + this.margin.bottom);
     */

    const svg = select(this.axesRef.nativeElement)
      .attr('width', width + (this.margin.left + this.margin.right))
      .attr('height', height + (this.margin.top + this.margin.bottom));

    const xScale = scaleLinear().domain([0, maxTime]).range([0, width]);
    const yScale = scaleLinear().domain([maxFreq / 1000, 0]).range([0, height]);

    const xAxis = axisBottom(xScale);
    const yAxis = axisLeft(yScale);

    svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .call(yAxis);
    svg.append('g')
      .attr('transform', `translate(${this.margin.left},${(height + this.margin.top)})`)
      .call(xAxis);
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

  private drawRange() {

  }
}
