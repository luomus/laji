import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  HostListener,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import {Selection, select, event, clientPoint} from 'd3-selection';
import {ScaleLinear, scaleLinear} from 'd3-scale';
import { drag } from 'd3-drag';
import { brush } from 'd3-brush';
import {Subscription} from 'rxjs';
import {delay} from 'rxjs/operators';
import {SpectrogramService} from '../service/spectrogram.service';
import { AudioViewerUtils } from '../service/audio-viewer-utils';
import {AudioViewerMode, IAudioViewerArea} from '../models';

@Component({
  selector: 'laji-audio-spectrogram',
  templateUrl: './audio-spectrogram.component.html',
  styleUrls: ['./audio-spectrogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioSpectrogramComponent implements OnChanges {
  @ViewChild('container', {static: true}) containerRef: ElementRef<HTMLDivElement>;
  @ViewChild('spectrogram', {static: true}) spectrogramRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('chart', {static: true}) chartRef: ElementRef<SVGElement>;

  @Input() buffer: AudioBuffer;
  @Input() sampleRate: number;
  @Input() nperseg: number;
  @Input() noverlap: number;
  @Input() currentTime: number;

  @Input() focusArea: IAudioViewerArea;
  @Input() highlightFocusArea = false;
  @Input() zoomFrequency = false;
  @Input() frequencyPaddingOnZoom = 500;
  @Input() mode: AudioViewerMode;

  @Output() spectrogramReady = new EventEmitter();
  @Output() dragStart = new EventEmitter();
  @Output() dragEnd = new EventEmitter<number>();
  @Output() brushEnd = new EventEmitter<number[][]>();

  margin: { top: number, bottom: number, left: number, right: number} = { top: 10, bottom: 20, left: 30, right: 10};

  private drawSub: Subscription;

  private imageData: ImageData;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;
  private scrollLine: Selection<SVGLineElement, any, any, any>;

  private startFreq: number;
  private endFreq: number;

  constructor(
    private spectrogramService: SpectrogramService,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize')
  onResize() {
    const canvas = this.spectrogramRef.nativeElement;
    if (this.imageData) {
      const elementWidth = this.containerRef.nativeElement.offsetWidth - this.margin.left - 20;
      if (elementWidth < 0) {
        setTimeout(() => {
          this.onResize();
        }, 10);
        return;
      }
      const elementHeight = this.imageData.height;
      canvas.style.width = elementWidth + 'px';
      canvas.style.height = elementHeight + 'px';

      this.updateChart(elementWidth, elementHeight);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.buffer) {
      this.imageData = undefined;
      this.clearSpectrogram();

      if (this.drawSub) {
        this.drawSub.unsubscribe();
      }
      if (this.buffer) {
        this.drawSub = this.spectrogramService.getSpectrogramImageData(this.buffer, this.sampleRate, this.nperseg, this.noverlap)
          .pipe(delay(0))
          .subscribe((result) => {
            this.imageData = result;
            this.drawImage(this.imageData, this.spectrogramRef.nativeElement);

            this.spectrogramReady.emit();
            this.cdr.markForCheck();
          });
      }
    } else {
      if (changes.currentTime && this.scrollLine) {
        this.updateScrollLinePosition();
      }
      if (changes.zoomFrequency && this.imageData) {
        this.drawImage(this.imageData, this.spectrogramRef.nativeElement);
      }
      if (changes.mode) {
        this.onResize();
      }
    }
  }

  private updateChart(width, height) {
    const svg = select(this.chartRef.nativeElement)
      .attr('width', width + (this.margin.left + this.margin.right))
      .attr('height', height + (this.margin.top + this.margin.bottom));

    svg.selectAll('*').remove();

    this.xScale = scaleLinear().domain([0, this.buffer.duration]).range([0, width]);
    this.yScale = scaleLinear().domain([this.endFreq / 1000, this.startFreq / 1000]).range([0, height]);

    const xAxis = axisBottom(this.xScale);
    const yAxis = axisLeft(this.yScale);

    if (this.mode === 'default') {
      // make spectrogram clickable
      svg.on('click', () => {
        const x = clientPoint(event.target, event)[0];
        this.setTimeToPosition(x);
        this.dragEnd.emit(this.currentTime);
      });
      svg.style('cursor', 'pointer');
    }

    // draw axes
    svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .call(yAxis);
    svg.append('g')
      .attr('transform', `translate(${this.margin.left},${(height + this.margin.top)})`)
      .call(xAxis);

    // x-axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', this.margin.left + width / 2)
      .attr('y', height + this.margin.top + 35)
      .text('Aika (s)');

    // y-axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -this.margin.left + 25)
      .attr('x', -this.margin.top - height / 2)
      .text('Taajuus (kHz)');

    // draw scroll line
    const scrollLineDrag = drag()
      .on('start', () => { this.dragStart.emit(); })
      .on('drag', () => {
        this.setTimeToPosition(event.x);
      })
      .on('end', () => { this.dragEnd.emit(this.currentTime); });

    this.scrollLine = svg.append('line')
      .attr('y1', this.margin.top)
      .attr('y2', this.margin.top + height)
      .attr('stroke-width', 2)
      .attr('stroke', 'black');
    if (this.mode === 'default') {
      this.scrollLine.call(scrollLineDrag).style('cursor', 'pointer');
    }

    this.updateScrollLinePosition();

    // draw white rectangle
    if (this.focusArea) {
      const rectX = this.focusArea.xRange ? this.margin.left + this.xScale(this.focusArea.xRange[0]) : this.margin.left;
      const rectWidth = this.focusArea.xRange ? this.xScale(this.focusArea.xRange[1] - this.focusArea.xRange[0]) : width;
      const rectY = this.focusArea.yRange ? this.margin.top + this.yScale(this.focusArea.yRange[1] / 1000) : this.margin.top;
      const rectHeight = this.focusArea.yRange ? this.yScale((this.endFreq - (this.focusArea.yRange[1] - this.focusArea.yRange[0])) / 1000) : height;

      if (this.highlightFocusArea) {
        const group = svg.append('g')
          .attr('fill', 'black')
          .attr('opacity', 0.4);

        group.append('rect')
          .attr('x', this.margin.left)
          .attr('y', this.margin.top)
          .attr('width', rectX - this.margin.left)
          .attr('height', height);

        group.append('rect')
          .attr('x', rectX + rectWidth)
          .attr('y', this.margin.top)
          .attr('width', width - (rectX + rectWidth - this.margin.left))
          .attr('height', height);

        group.append('rect')
          .attr('x', this.margin.left)
          .attr('y', this.margin.top)
          .attr('width', width)
          .attr('height', rectY - this.margin.top);

        group.append('rect')
          .attr('x', this.margin.left)
          .attr('y', rectY + rectHeight)
          .attr('width', width)
          .attr('height', height - (rectY + rectHeight - this.margin.top));
      }

      svg.append('rect')
        .attr('x', rectX)
        .attr('y', rectY)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('stroke-width', 2)
        .attr('stroke', 'white')
        .attr('fill', 'none');
    }

    if (this.mode === 'brush') {
      const brushFunc = brush()
        .extent([[this.margin.left, this.margin.top], [this.margin.left + width, this.margin.top + height]])
        .on('end', () => {
          if (!event.selection) {
            return;
          }
          const [[x0, y0], [x1, y1]] = event.selection;

          const xMin = Math.min(x0, x1);
          const xMax = Math.max(x0, x1);
          const yMin = Math.min(y0, y1);
          const yMax = Math.max(y0, y1);

          this.brushEnd.emit([
            [this.xScale.invert(xMin - this.margin.left), this.xScale.invert(xMax - this.margin.left)],
            [this.yScale.invert(yMax - this.margin.top) * 1000, this.yScale.invert(yMin - this.margin.top) * 1000]
          ]);
        });

      svg.append('g')
        .attr('class', 'brush')
        .call(brushFunc);
    }
  }

  private setTimeToPosition(x: number) {
    const time = this.xScale.invert(x - this.margin.left);
    this.currentTime = Math.min(Math.max(time, 0), this.buffer.duration);
    this.updateScrollLinePosition();
  }

  private updateScrollLinePosition() {
    const position = this.margin.left + this.xScale(this.currentTime);
    this.scrollLine.attr('x1', position);
    this.scrollLine.attr('x2', position);
  }

  private drawImage(data: ImageData, canvas: HTMLCanvasElement) {
    const maxFreq = Math.floor(this.sampleRate / 2);
    [this.startFreq, this.endFreq] = AudioViewerUtils.getPaddedRange(
      this.focusArea?.yRange, this.zoomFrequency ? this.frequencyPaddingOnZoom : undefined, 0, maxFreq
    );

    const ratio1 = this.startFreq / maxFreq;
    const ratio2 = this.endFreq / maxFreq;
    const startY = data.height - (data.height * ratio2);

    canvas.width = data.width;
    canvas.height = data.height * (ratio2 - ratio1);

    const ctx = canvas.getContext('2d');
    ctx.putImageData(data, 0, -startY, 0, startY, canvas.width, canvas.height);

    this.onResize();
  }

  private clearSpectrogram() {
    const canvas = this.spectrogramRef.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const svg = select(this.chartRef.nativeElement);
    svg.selectAll('*').remove();
  }
}
