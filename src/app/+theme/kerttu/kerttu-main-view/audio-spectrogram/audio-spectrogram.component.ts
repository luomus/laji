import {Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import {Selection, select, event, clientPoint} from 'd3-selection';
import {ScaleLinear, scaleLinear} from 'd3-scale';
import * as d3Drag from 'd3-drag';
import {AudioService} from '../../service/audio.service';
import {Subscription} from 'rxjs';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'laji-audio-spectrogram',
  templateUrl: './audio-spectrogram.component.html',
  styleUrls: ['./audio-spectrogram.component.scss']
})
export class AudioSpectrogramComponent implements OnChanges {
  @ViewChild('container', {static: true}) containerRef: ElementRef<HTMLDivElement>;
  @ViewChild('spectrogram', {static: true}) spectrogramRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('chart', {static: true}) chartRef: ElementRef<SVGElement>;

  @Input() buffer: AudioBuffer;
  @Input() nperseg: number;
  @Input() noverlap: number;
  @Input() currentTime: number;

  @Input() xRange: number[];
  @Input() yRange: number[];

  @Input() zoomed = false;
  @Input() frequencyPadding = 200;

  @Output() spectrogramReady = new EventEmitter();
  @Output() startDrag = new EventEmitter();
  @Output() endDrag = new EventEmitter<number>();

  margin: { top: number, bottom: number, left: number, right: number} = { top: 10, bottom: 20, left: 30, right: 10};

  private drawSub: Subscription;

  private imageData: ImageData;
  private maxFreq: number;
  private maxTime: number;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;
  private scrollLine: Selection<SVGLineElement, any, any, any>;

  private startFreq: number;
  private endFreq: number;

  constructor(
    private audioService: AudioService,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize')
  onResize() {
    const canvas = this.spectrogramRef.nativeElement;
    if (!isNaN(this.maxFreq) && !isNaN(this.maxTime)) {
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
      if (this.drawSub) {
        this.drawSub.unsubscribe();
      }
      if (this.buffer) {
        this.drawSub = this.audioService.getSpectrogramImageData(this.buffer, this.nperseg, this.noverlap)
          .pipe(delay(0))
          .subscribe((result) => {
            this.imageData = result.imageData;
            this.maxFreq = result.maxFreq;
            this.maxTime = result.maxTime;
            this.drawImage(this.imageData, this.spectrogramRef.nativeElement);

            this.spectrogramReady.emit();
            this.cdr.markForCheck();
          });
      }
    }
    if (changes.currentTime && this.scrollLine) {
      this.updateScrollLinePosition();
    }
    if (changes.zoomed) {
      this.drawImage(this.imageData, this.spectrogramRef.nativeElement);
    }
  }

  private updateChart(width, height) {
    const svg = select(this.chartRef.nativeElement)
      .attr('width', width + (this.margin.left + this.margin.right))
      .attr('height', height + (this.margin.top + this.margin.bottom));

    svg.selectAll('*').remove();

    this.xScale = scaleLinear().domain([0, this.maxTime]).range([0, width]);
    this.yScale = scaleLinear().domain([this.endFreq / 1000, this.startFreq / 1000]).range([0, height]);

    const xAxis = axisBottom(this.xScale);
    const yAxis = axisLeft(this.yScale);

    // make spectrogram clickable
    svg.on('click', () => {
      const x = clientPoint(event.target, event)[0];
      this.setTimeToPosition(x);
      this.endDrag.emit(this.currentTime);
    });
    svg.style('cursor', 'pointer');

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

    // draw white rectangle
    const rectY = this.yRange ? this.margin.top + this.yScale(this.yRange[1] / 1000) : this.margin.top;
    const rectHeight = this.yRange ? this.yScale((this.endFreq - (this.yRange[1] - this.yRange[0])) / 1000) : height;

    svg.append('rect')
      .attr('x', this.margin.left + this.xScale(this.xRange[0]))
      .attr('y', rectY)
      .attr('width', this.xScale(this.xRange[1] - this.xRange[0]))
      .attr('height', rectHeight)
      .attr('stroke-width', 2)
      .attr('stroke', 'white')
      .attr('fill', 'none');

    // draw scroll line
    const drag = d3Drag.drag()
      .on('start', () => { this.startDrag.emit(); })
      .on('drag', () => {
        this.setTimeToPosition(event.x);
      })
      .on('end', () => { this.endDrag.emit(this.currentTime); });

    this.scrollLine = svg.append('line')
      .attr('y1', this.margin.top)
      .attr('y2', this.margin.top + height)
      .attr('stroke-width', 2)
      .attr('stroke', 'black')
      .call(drag)
      .style('cursor', 'pointer');

    this.updateScrollLinePosition();
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
    this.startFreq = this.zoomed ? Math.max(this.yRange[0] - this.frequencyPadding, 0) : 0;
    this.endFreq = this.zoomed ? Math.min(this.yRange[1] + this.frequencyPadding, this.maxFreq) : this.maxFreq;

    const ratio1 = this.startFreq / this.maxFreq;
    const ratio2 = this.endFreq / this.maxFreq;
    const startY = data.height - (data.height * ratio2);

    canvas.width = data.width;
    canvas.height = data.height * (ratio1 + ratio2);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, data.width, data.height);
    ctx.putImageData(data, 0, -startY, 0, startY, canvas.width, canvas.height);

    this.onResize();
  }
}
