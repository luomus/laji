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
import {TranslateService} from '@ngx-translate/core';

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
  @Input() brushArea: IAudioViewerArea;
  @Input() zoomFrequency = false;
  @Input() frequencyPaddingOnZoom = 500;
  @Input() mode: AudioViewerMode;

  @Output() spectrogramReady = new EventEmitter();
  @Output() dragStart = new EventEmitter();
  @Output() dragEnd = new EventEmitter<number>();
  @Output() brushEnd = new EventEmitter<IAudioViewerArea>();

  margin: { top: number, bottom: number, left: number, right: number} = { top: 10, bottom: 20, left: 30, right: 10};

  private drawSub: Subscription;

  private imageData: ImageData;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;
  private scrollLine: Selection<SVGLineElement, any, any, any>;

  private startFreq: number;
  private endFreq: number;
  private startTime: number;
  private endTime: number;

  constructor(
    private translate: TranslateService,
    private spectrogramService: SpectrogramService,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize')
  onResize() {
    const canvas = this.spectrogramRef.nativeElement;
    if (this.imageData) {
      const elementWidth = this.containerRef.nativeElement.offsetWidth - this.margin.left - 20;
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
      if ((changes.zoomFrequency || changes.brushArea) && this.imageData) {
        this.drawImage(this.imageData, this.spectrogramRef.nativeElement);
      } else if (changes.mode) {
        this.onResize();
      } else if (changes.currentTime && this.scrollLine) {
        this.updateScrollLinePosition();
      }
    }
  }

  private updateChart(width: number, height: number) {
    const svg = select(this.chartRef.nativeElement)
      .attr('width', width + (this.margin.left + this.margin.right))
      .attr('height', height + (this.margin.top + this.margin.bottom));

    svg.selectAll('*').remove();

    this.xScale = scaleLinear().domain([this.startTime, this.endTime]).range([0, width]);
    this.yScale = scaleLinear().domain([this.endFreq / 1000, this.startFreq / 1000]).range([0, height]);

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
      .text(this.translate.instant('theme.kerttu.audioViewer.time') + ' (s)');

    // y-axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -this.margin.left + 25)
      .attr('x', -this.margin.top - height / 2)
      .text(this.translate.instant('theme.kerttu.audioViewer.frequency') + ' (kHz)');

    const innerSvg = svg.append('svg')
      .attr('x', this.margin.left)
      .attr('y', this.margin.top)
      .attr('width', width)
      .attr('height', height);

    this.drawInnerChart(innerSvg, width, height);
  }

  private drawInnerChart(svg: Selection<SVGSVGElement, any, any, any>, width: number, height: number) {
    const maxFreq = Math.floor(this.sampleRate / 2);
    const xRange = this.focusArea?.xRange ? this.focusArea.xRange : [0, this.buffer.duration];
    const yRange = this.focusArea?.yRange ? this.focusArea.yRange : [0, maxFreq];

    const rectX = this.xScale(xRange[0]);
    const rectWidth = this.xScale(xRange[1] - xRange[0] + this.startTime);
    const rectY = this.yScale(yRange[1] / 1000);
    const rectHeight = this.yScale((this.endFreq - (yRange[1] - yRange[0])) / 1000);

    if (this.highlightFocusArea) {
      const group = svg.append('g')
        .attr('fill', 'black')
        .attr('opacity', 0.4);

      group.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', rectX)
        .attr('height', height);

      group.append('rect')
        .attr('x', rectX + rectWidth)
        .attr('y', 0)
        .attr('width', width - (rectX + rectWidth))
        .attr('height', height);

      group.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', rectY);

      group.append('rect')
        .attr('x', 0)
        .attr('y', rectY + rectHeight)
        .attr('width', width)
        .attr('height', height - (rectY + rectHeight));
    }

    // draw focus area with white rectangle
    if (this.focusArea) {
      svg.append('rect')
        .attr('x', rectX)
        .attr('y', rectY)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('stroke-width', 2)
        .attr('stroke', 'white')
        .attr('fill', 'none');
    }

    // draw scroll line
    this.scrollLine = svg.append('line')
      .attr('id', 'scrollLine')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke-width', 2)
      .attr('stroke', 'red');
    this.updateScrollLinePosition();

    // add functions
    if (this.mode === 'default') {
      // make spectrogram clickable by adding a transparent rectangle that catches click events
      const onlyFocusAreaClickable = this.highlightFocusArea && !this.brushArea;

      svg.attr('pointer-events', 'all');
      svg.insert('rect', '#scrollLine')
        .attr('x', onlyFocusAreaClickable ? rectX : 0)
        .attr('y', onlyFocusAreaClickable ? rectY : 0)
        .attr('width', onlyFocusAreaClickable ? rectWidth : width)
        .attr('height', onlyFocusAreaClickable ? rectHeight : height)
        .attr('fill', 'none')
        .on('click', () => {
          const x = clientPoint(event.target, event)[0];
          this.dragEnd.emit(this.getTimeFromPosition(x, onlyFocusAreaClickable));
        }).style('cursor', 'pointer');

      // make scroll line draggable
      const scrollLineDrag = drag()
        .on('start', () => { this.dragStart.emit(); })
        .on('drag', () => {
          this.currentTime = this.getTimeFromPosition(event.x, onlyFocusAreaClickable);
          this.updateScrollLinePosition();
        })
        .on('end', () => { this.dragEnd.emit(this.currentTime); });
      this.scrollLine.call(scrollLineDrag).style('cursor', 'pointer');
    } else if (this.mode === 'brush') {
      // add brush functionality
      const brushFunc = brush()
        .on('end', () => {
          if (!event.selection) {
            return;
          }
          const [[x0, y0], [x1, y1]] = event.selection;

          const xMin = Math.min(x0, x1);
          const xMax = Math.max(x0, x1);
          const yMin = Math.min(y0, y1);
          const yMax = Math.max(y0, y1);

          this.brushEnd.emit({
            xRange: [this.xScale.invert(xMin), this.xScale.invert(xMax)],
            yRange: [this.yScale.invert(yMax) * 1000, this.yScale.invert(yMin) * 1000]
          });
        });

      svg.append('g')
        .attr('class', 'brush')
        .call(brushFunc);
    }
  }

  private getTimeFromPosition(x: number, onlyFocusAreaClickable: boolean) {
    const time = this.xScale.invert(x);
    const minTime = onlyFocusAreaClickable ? this.focusArea?.xRange[0] : this.startTime;
    const maxTime = onlyFocusAreaClickable ? this.focusArea?.xRange[1] : this.endTime;
    return Math.min(Math.max(time, minTime), maxTime);
  }

  private updateScrollLinePosition() {
    const position = this.xScale(this.currentTime);
    this.scrollLine.attr('x1', position);
    this.scrollLine.attr('x2', position);
  }

  private drawImage(data: ImageData, canvas: HTMLCanvasElement) {
    const maxTime = this.buffer.duration;
    const maxFreq = Math.floor(this.sampleRate / 2);

    if (this.brushArea) {
      [this.startTime, this.endTime] = this.brushArea.xRange;
      [this.startFreq, this.endFreq] = this.brushArea.yRange;
    } else {
      [this.startTime, this.endTime] = [0, maxTime];
      [this.startFreq, this.endFreq] = AudioViewerUtils.getPaddedRange(
        this.focusArea?.yRange, this.zoomFrequency ? this.frequencyPaddingOnZoom : undefined, 0, maxFreq
      );
    }

    const ratioX1 = this.startTime / maxTime;
    const ratioX2 = this.endTime / maxTime;
    const startX = data.width * ratioX1;

    const ratioY1 = this.startFreq / maxFreq;
    const ratioY2 = this.endFreq / maxFreq;
    const startY = data.height - (data.height * ratioY2);

    canvas.width = data.width * (ratioX2 - ratioX1);
    canvas.height = data.height * (ratioY2 - ratioY1);

    const ctx = canvas.getContext('2d');
    ctx.putImageData(data, -startX, -startY, startX, startY, canvas.width, canvas.height);

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
