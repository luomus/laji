import { Component, OnChanges, ChangeDetectionStrategy, ViewChild, ElementRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { Selection, select, event, clientPoint } from 'd3-selection';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { drag } from 'd3-drag';
import { brush } from 'd3-brush';
import { AudioViewerMode, IAudioViewerArea, IAudioViewerRectangle } from '../../../models';

@Component({
  selector: 'laji-spectrogram-chart',
  templateUrl: './spectrogram-chart.component.html',
  styleUrls: ['./spectrogram-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectrogramChartComponent implements OnChanges {
  @ViewChild('chart', {static: true}) chartRef: ElementRef<SVGElement>;

  @Input() view: IAudioViewerArea;
  @Input() focusArea: IAudioViewerArea;
  @Input() highlightFocusArea = false;
  @Input() onlyFocusAreaClickable = false;
  @Input() onlyFocusAreaDrawable = false;
  @Input() focusAreaColor?: string;
  @Input() showAxisLabels = true;
  @Input() axisFontSize = 10;
  @Input() rectangles: IAudioViewerRectangle[];

  @Input() currentTime = 0;

  @Input() width: number;
  @Input() height: number;
  @Input() margin: { top: number; bottom: number; left: number; right: number };

  @Input() mode: AudioViewerMode = 'default';

  @Output() dragStart = new EventEmitter();
  @Output() dragEnd = new EventEmitter<number>();
  @Output() spectrogramClick = new EventEmitter<number>();
  @Output() spectrogramDblclick = new EventEmitter<number>();
  @Output() zoomEnd = new EventEmitter<IAudioViewerArea>();
  @Output() drawEnd = new EventEmitter<IAudioViewerArea>();

  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;
  private scrollLine: Selection<SVGLineElement, any, any, any>;

  constructor(
    private translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentTime && Object.keys(changes).length === 1) {
      if (this.scrollLine) {
        this.updateScrollLinePosition();
      }
    } else {
      this.updateChart();
    }
  }

  private updateChart() {
    this.clearChart();
    this.drawChart();
  }

  private drawChart() {
    const svg = select(this.chartRef.nativeElement)
      .attr('width', this.width + (this.margin.left + this.margin.right))
      .attr('height', this.height + (this.margin.top + this.margin.bottom));

    if (!this.width || !this.height || !this.view) {
      return;
    }

    this.xScale = scaleLinear().domain([this.view.xRange[0], this.view.xRange[1]]).range([0, this.width]);
    this.yScale = scaleLinear().domain([this.view.yRange[1] / 1000, this.view.yRange[0] / 1000]).range([0, this.height]);

    const xAxis = axisBottom(this.xScale);
    xAxis.ticks(this.width / 100);
    const yAxis = axisLeft(this.yScale);
    yAxis.ticks(this.height / 20);

    // draw axes
    svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .style('font-size', this.axisFontSize + 'px')
      .call(yAxis);
    svg.append('g')
      .attr('transform', `translate(${this.margin.left},${(this.height + this.margin.top)})`)
      .style('font-size', this.axisFontSize + 'px')
      .call(xAxis);

    if (this.showAxisLabels) {
      // x-axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', this.margin.left + this.width / 2)
        .attr('y', this.height + this.margin.top + 35)
        .text(this.translate.instant('audioViewer.time') + ' (s)');

      // y-axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -this.margin.left + 65)
        .attr('x', -this.margin.top - this.height / 2)
        .text(this.translate.instant('audioViewer.frequency') + ' (kHz)');
    }

    let svgWithOverflow: Selection<SVGSVGElement, any, any, any>;
    if (this.rectangles?.length > 0) {
      // allow rectangle labels overflow the chart
      svgWithOverflow = svg.append('svg')
        .attr('x', this.margin.left)
        .attr('y', this.margin.top)
        .attr('width', this.width)
        .attr('height', this.height)
        .style('overflow', 'visible');
    }

    const innerSvg = svg.append('svg')
      .attr('x', this.margin.left)
      .attr('y', this.margin.top)
      .attr('width', this.width)
      .attr('height', this.height);

    if (this.rectangles?.length > 0) {
      this.drawRectangles(innerSvg, svgWithOverflow, 1);
    }

    this.drawInnerChart(innerSvg);
  }

  private drawInnerChart(svg: Selection<SVGSVGElement, any, any, any>) {
    const strokeWidth = 2;
    const [startTime, endTime] = this.view.xRange;
    const [startFreq, endFreq] = this.view.yRange;

    let [clickAreaX, clickAreaY, clickAreaWidth, clickAreaHeight] = [0, 0, this.width, this.height];
    let [brushAreaX, brushAreaY, brushAreaWidth, brushAreaHeight] = [0, 0, this.width, this.height];
    const needToDrawFocusArea = this.focusArea && !this.areaIsInsideAnotherArea(this.view, this.focusArea);
    if (needToDrawFocusArea) {
      let [areaX, areaY, areaWidth, areaHeight] = this.drawFocusArea(svg, startTime, endTime, startFreq, endFreq, strokeWidth);
      [areaX, areaY, areaWidth, areaHeight] = [Math.max(areaX, 0), Math.max(areaY, 0), Math.min(areaWidth, this.width), Math.min(areaHeight, this.height)];
      if (this.onlyFocusAreaClickable) {
        [clickAreaX, clickAreaY, clickAreaWidth, clickAreaHeight] = [areaX, areaY, areaWidth, areaHeight];
      }
      if (this.onlyFocusAreaDrawable && this.mode === 'draw') {
        [brushAreaX, brushAreaY, brushAreaWidth, brushAreaHeight] = [areaX, areaY, areaWidth, areaHeight];
      }
    }

    // draw scroll line
    this.scrollLine = svg.append('line')
      .attr('id', 'scrollLine')
      .attr('y1', 0)
      .attr('y2', this.height)
      .attr('stroke-width', strokeWidth)
      .attr('stroke', 'red');
    this.updateScrollLinePosition();

    // add functions
    if (this.mode === 'default') {
      // make spectrogram clickable by adding a transparent rectangle that catches click events
      svg.attr('pointer-events', 'all');
      svg.insert('rect', '#scrollLine')
        .attr('x', clickAreaX)
        .attr('y', clickAreaY)
        .attr('width', clickAreaWidth)
        .attr('height', clickAreaHeight)
        .attr('fill', 'none')
        .on('click', () => {
          const x = clientPoint(event.target, event)[0];
          this.spectrogramClick.emit(this.getTimeFromPosition(x));
        })
        .on('dblclick', () => {
          const x = clientPoint(event.target, event)[0];
          this.spectrogramDblclick.emit(this.getTimeFromPosition(x));
        }).style('cursor', 'pointer');

      // make scroll line draggable
      const scrollLineDrag = drag<any, unknown>()
        .on('start', () => { this.dragStart.emit(); })
        .on('drag', () => {
          this.currentTime = this.getTimeFromPosition(event.x);
          this.updateScrollLinePosition();
        })
        .on('end', () => { this.dragEnd.emit(this.currentTime); });
      this.scrollLine.call(scrollLineDrag).style('cursor', 'pointer');
    } else if (this.mode === 'zoom' || this.mode === 'draw') {
      // add brush functionality
      const brushFunc = brush()
        .extent([[brushAreaX, brushAreaY], [brushAreaX + brushAreaWidth, brushAreaY + brushAreaHeight]])
        .on('end', () => {
          if (!event.selection) {
            return;
          }
          const [[x0, y0], [x1, y1]] = event.selection;

          const xMin = Math.max(Math.min(x0, x1), brushAreaX);
          const xMax = Math.min(Math.max(x0, x1), brushAreaX + brushAreaWidth);
          const yMin = Math.max(Math.min(y0, y1), brushAreaY);
          const yMax = Math.min(Math.max(y0, y1), brushAreaY + brushAreaHeight);

          const area = {
            xRange: [this.xScale.invert(xMin), this.xScale.invert(xMax)],
            yRange: [this.yScale.invert(yMax) * 1000, this.yScale.invert(yMin) * 1000]
          };
          if (this.mode === 'zoom') {
            this.zoomEnd.emit(area);
          } else {
            this.drawEnd.emit(area);
          }
        });

      svg.append('g')
        .attr('class', 'brush')
        .call(brushFunc);
    }
  }

  private drawFocusArea(
    svg: Selection<SVGSVGElement, any, any, any>, startTime: number, endTime: number, startFreq: number, endFreq: number, strokeWidth: number
  ): number[] {
    const xRangeBuffer = this.xScale.invert(strokeWidth);
    const yRangeBuffer = this.yScale.invert(this.height - strokeWidth) * 1000;
    const xRange = this.focusArea?.xRange || [startTime - xRangeBuffer, endTime + xRangeBuffer];
    const yRange = this.focusArea?.yRange || [startFreq - yRangeBuffer, endFreq + yRangeBuffer];

    const [rectX, rectWidth, rectY, rectHeight] = this.getRectangleDimensions(xRange, yRange);

    if (this.highlightFocusArea) {
      // highlight focus area by darkening other areas by drawing semi-transparent black rectangles around it
      const group = svg.append('g')
        .attr('fill', 'black')
        .attr('opacity', 0.4);

      group.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', rectX)
        .attr('height', this.height);

      group.append('rect')
        .attr('x', rectX + rectWidth)
        .attr('y', 0)
        .attr('width', this.width - (rectX + rectWidth))
        .attr('height', this.height);

      group.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.width)
        .attr('height', rectY);

      group.append('rect')
        .attr('x', 0)
        .attr('y', rectY + rectHeight)
        .attr('width', this.width)
        .attr('height', this.height - (rectY + rectHeight));
    }

    // draw focus area with a rectangle
    svg.append('rect')
      .attr('x', rectX)
      .attr('y', rectY)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('stroke-width', strokeWidth)
      .attr('stroke', this.focusAreaColor || 'white')
      .attr('fill', 'none');

    return [rectX, rectY, rectWidth, rectHeight];
  }

  private drawRectangles(
    svg: Selection<SVGSVGElement, any, any, any>, svgWithOverflow: Selection<SVGSVGElement, any, any, any>, strokeWidth: number
  ) {
    const drawData = this.getRectangleDrawData(this.rectangles);

    for (const data of drawData) {
      const [rectX, rectWidth, rectY, rectHeight] = data.dimensions;
      svg.append('rect')
      .attr('x', rectX)
      .attr('y', rectY)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('stroke-width', strokeWidth)
      .attr('stroke', data.color[data.color.length - 1] || '#d98026')
      .attr('fill', 'none');

      if (data.label.length > 0 && this.rectangleIsCompletelyVisible(rectX, rectWidth, rectY, rectHeight)) {
        const text = svgWithOverflow.append('text')
        .attr('x', rectX + (rectWidth / 2))
        .attr('y', rectY - 5)
        .attr('text-anchor', 'middle');

        for (let i = 0; i < data.label.length; i++) {
          const last = i === data.label.length - 1;
          text.append('tspan')
            .attr('fill', data.color[i] || '#d98026')
            .text(data.label[i] + (last ? '' : ' '));
        }
      }
    }
  }

  private getTimeFromPosition(x: number): number {
    const time = this.xScale.invert(x);
    const minTime = this.onlyFocusAreaClickable ? this.focusArea?.xRange[0] : this.view.xRange[0];
    const maxTime = this.onlyFocusAreaClickable ? this.focusArea?.xRange[1] : this.view.xRange[1];
    return Math.min(Math.max(time, minTime), maxTime);
  }

  private updateScrollLinePosition() {
    const position = this.xScale(this.currentTime);
    this.scrollLine.attr('x1', position);
    this.scrollLine.attr('x2', position);
  }

  private clearChart() {
    const svg = select(this.chartRef.nativeElement);
    svg.selectAll('*').remove();
  }

  private getRectangleDimensions(xRange: number[], yRange: number[]): number[] {
    const startTime = this.view.xRange[0];
    const endFreq = this.view.yRange[1];

    const rectX = this.xScale(xRange[0]);
    const rectWidth = this.xScale(xRange[1] - xRange[0] + startTime);
    const rectY = this.yScale(yRange[1] / 1000);
    const rectHeight = this.yScale((endFreq - (yRange[1] - yRange[0])) / 1000);

    return [rectX, rectWidth, rectY, rectHeight];
  }

  private getRectangleDrawData(rectangles: IAudioViewerRectangle[]): { dimensions: number[]; color: string[]; label: string[] }[] {
    return (rectangles || []).reduce((result, current) => {
      const dim = this.getRectangleDimensions(current.area.xRange, current.area.yRange);
      const duplicates = result.filter(value => this.rectanglesAreSame(value.dimensions, dim));
      if (duplicates.length > 0) {
        const duplicate = duplicates[0];
        duplicate.color.push(current.color);
        if (current.label) {
          duplicate.label.push(current.label);
        }
      } else {
        result.push({
          dimensions: dim,
          color: [current.color],
          label: current.label ? [current.label] : []
        });
      }
      return result;
    }, []);
  }

  private rectanglesAreSame(dim1: number[], dim2: number[]): boolean {
    for (let i = 0; i < dim1.length; i++) {
      if (dim1[i] !== dim2[i]) {
        return false;
      }
    }
    return true;
  }

  private rectangleIsCompletelyVisible(rectX: number, rectWidth: number, rectY: number, rectHeight: number, precision = 0.001): boolean {
    return (
      rectX >= -precision && rectX + rectWidth <= this.width + precision &&
      rectY >= -precision && rectY + rectHeight <= this.height + precision
    );
  }

  private areaIsInsideAnotherArea(area1: IAudioViewerArea, area2: IAudioViewerArea): boolean {
    if (!(area1.xRange && area2.xRange && area2.xRange[0] <= area1.xRange[0] && area2.xRange[1] >= area1.xRange[1])) {
      return false;
    }

    return !(area1.yRange && area2.yRange && area2.yRange[0] <= area1.yRange[0] && area2.yRange[1] >= area1.yRange[1]);
  }
}
