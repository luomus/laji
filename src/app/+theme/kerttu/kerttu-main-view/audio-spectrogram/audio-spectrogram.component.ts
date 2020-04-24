import {Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import {Selection, select} from 'd3-selection';
import {ScaleLinear, scaleLinear} from 'd3-scale';
import {AudioService} from '../../service/audio.service';
import {Subscription} from 'rxjs';

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
  @Input() nperseg = 512;
  @Input() noverlap = 256;
  @Input() currentTime: number;

  @Input() xRange: number[];
  @Input() yRange: number[];

  @Output() spectrogramReady = new EventEmitter<boolean>();

  private drawSub: Subscription;

  private margin: { top: number, bottom: number, left: number, right: number} = { top: 10, bottom: 20, left: 30, right: 10};
  private maxFreq: number;
  private maxTime: number;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;
  private scrollLine: Selection<SVGLineElement, any, any, any>;

  constructor(
    private audioService: AudioService,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize')
  onResize() {
    const canvas = this.spectrogramRef.nativeElement;
    if (canvas.height > 0) {
      const elementWidth = this.containerRef.nativeElement.offsetWidth - this.margin.left - 20;
      const elementHeight = canvas.height;
      canvas.style.width = elementWidth + 'px';
      canvas.style.height = elementHeight + 'px';

      this.updateChart(elementWidth, elementHeight, this.maxFreq, this.maxTime);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.buffer) {
      if (this.drawSub) {
        this.drawSub.unsubscribe();
      }
      if (this.buffer) {
        this.drawSub = this.audioService.drawSpectrogramToCanvas(this.buffer, this.nperseg, this.noverlap, this.spectrogramRef.nativeElement).subscribe((result) => {
          this.maxFreq = result.maxFreq;
          this.maxTime = result.maxTime;
          this.onResize();
          setTimeout(() => {
            this.spectrogramReady.emit(true);
          });
          this.cdr.markForCheck();
        });
      }
    }
    if (changes.currentTime && this.scrollLine) {
      this.updateScrollLinePosition();
    }
  }

  private updateChart(width, height, maxFreq, maxTime) {
    const svg = select(this.chartRef.nativeElement)
      .attr('width', width + (this.margin.left + this.margin.right))
      .attr('height', height + (this.margin.top + this.margin.bottom));

    svg.selectAll('*').remove();

    this.xScale = scaleLinear().domain([0, maxTime]).range([0, width]);
    this.yScale = scaleLinear().domain([maxFreq / 1000, 0]).range([0, height]);

    const xAxis = axisBottom(this.xScale);
    const yAxis = axisLeft(this.yScale);

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
      .text('Time (s)');

    // y-axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -this.margin.left + 25)
      .attr('x', -this.margin.top - height / 2)
      .text('Frequency (kHz)');

    // draw red rectangle
    const rectangle = svg.append('rect')
    .attr('x', this.margin.left + this.xScale(this.xRange[0]))
    .attr('y', this.margin.top)
    .attr('width', this.xScale(this.xRange[1] - this.xRange[0]))
    .attr('height', height)
    .attr('stroke-width', 2)
    .attr('stroke', 'red')
    .attr('fill', 'none');

    // draw scroll line
    this.scrollLine = svg.append('line')
      .attr('y1', this.margin.top)
      .attr('y2', this.margin.top + height)
      .attr('stroke-width', 2)
      .attr('stroke', 'black');

    this.updateScrollLinePosition();
  }

  private updateScrollLinePosition() {
    const position = this.margin.left + this.xScale(this.currentTime);
    this.scrollLine.attr('x1', position);
    this.scrollLine.attr('x2', position);
  }
}
