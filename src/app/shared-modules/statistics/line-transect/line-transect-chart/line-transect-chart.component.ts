import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { ScriptService } from '../../../../shared/service/script.service';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { format } from 'd3-format';

interface LineTerms {
  slope: number;
  term: number;
}

export interface LineTransectChartTerms {
  upper: LineTerms;
  middle: LineTerms;
  lower: LineTerms;
}

@Component({
  selector: 'laji-line-transect-chart',
  template: `<div class='line-chart'></div>`,
  styleUrls: ['./line-transect-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectChartComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() xValue: number;
  @Input() yValue: number;
  @Input() terms: LineTransectChartTerms;
  @Input() xRange: [number, number] = [660, 780];
  @Input() yRange: [number, number] = [0, 100];
  @Input() xLabel: string;
  @Input() yLabel: string;
  @Input() title: string;
  @Input() margin: { top: number, bottom: number, left: number, right: number} = { top: 30, bottom: 40, left: 40, right: 10};
  @Input() xTickFormat: any;
  @Input() yLabelAnchor: string;

  private nativeElement: any;
  private svg: any;
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private xAxis: any;
  private yAxis: any;

  constructor(
    element: ElementRef,
    private scriptService: ScriptService,
    private cd: ChangeDetectorRef
  ) {
    this.nativeElement = element.nativeElement;
  }

  ngAfterViewInit() {
    this.createChart();
    if (this.yValue && this.xValue) {
      this.updateChart();
    }
    this.cd.markForCheck();
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy() {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }

  createChart() {
    const element = this.nativeElement;
    this.width = element.offsetWidth - (this.margin.left + this.margin.right);
    this.height = element.offsetHeight - (this.margin.top + this.margin.bottom);
    const svg = this.svg = select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);
    const g = svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'drawing')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // create scales
    this.xScale = scaleLinear().domain([this.xRange[0], this.xRange[1]]).range([0, this.width]);
    this.yScale = scaleLinear().domain([this.yRange[1], this.yRange[0]]).range([0, this.height]);

    // grid lines
    const yGridlinesAxis = axisLeft(this.yScale);
    const yGridlineNodes = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .call(yGridlinesAxis.tickSize(-this.width).tickFormat(null));
    this.styleGridlineNodes(yGridlineNodes);


    // create guide lines
    const line = d3Line()
      .x((d) => this.xScale(d[0]) + this.margin.left)
      .y((d) => this.yScale(d[1]) + this.margin.top);

    if (this.terms) {
      svg.append('path')
        .datum([this.getLine(this.terms.upper, this.xRange[0]), this.getLine(this.terms.upper, this.xRange[1])])
        .attr('d', line)
        .attr('stroke', 'red')
        .attr('stroke-dasharray', '7,7')
        .attr('stroke-width', 2)
        .attr('fill', 'none');

      svg.append('path')
        .datum([this.getLine(this.terms.lower, this.xRange[0]), this.getLine(this.terms.lower, this.xRange[1])])
        .attr('d', line)
        .attr('stroke', 'red')
        .attr('stroke-dasharray', '7,7')
        .attr('stroke-width', 2)
        .attr('fill', 'none');


      svg.append('path')
        .datum([this.getLine(this.terms.middle, this.xRange[0]), this.getLine(this.terms.middle, this.xRange[1])])
        .attr('d', line)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
    }

    if (this.xLabel) {
      svg.append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'end')
        .attr('x', element.offsetWidth)
        .attr('y', element.offsetHeight - 6)
        .text(this.xLabel);
    }

    if (this.yLabel) {
      svg.append('text')
        .attr('class', 'y label')
        .attr('text-anchor', this.yLabelAnchor || 'end')
        .attr('x', this.margin.left - 10)
        .attr('y', this.margin.top - 10)
        .text(this.yLabel);
    }

    if (this.title) {
      svg.append('text')
        .attr('class', 'title')
        .attr('text-anchor', 'middle')
        .attr('x', element.offsetWidth / 2)
        .attr('y', 13)
        .text(this.title);
    }

    // x & y axis
    const svgXAxis = axisBottom(this.xScale);
    if (this.xTickFormat) {
      svgXAxis.tickFormat(format(this.xTickFormat));
    }
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left},${(this.height + this.margin.top)})`)
      .call(svgXAxis);
  }

  updateChart() {
    const update = this.chart.selectAll('.mark')
      .data([[this.xValue, this.yValue]]);

    // remove exiting bars
    update.exit().remove();

    // update existing bars
    this.chart.selectAll('.mark').transition()
      .attr({
        cx: (d) => this.xScale(d[0]),
        cy: (d) => this.yScale(d[1])
      });

    // add new bars
    update
      .enter()
      .append('circle')
      .attr('class', 'mark')
      .attr('cx', (d) => this.xScale(d[0]))
      .attr('cy', (d) => this.yScale(d[1]))
      .attr('r', 3)
      .attr('fill', 'red')
      .attr('stroke', 'black');
  }

  styleGridlineNodes(axisNodes) {
    axisNodes.selectAll('.domain')
      .attr('fill', 'none')
      .attr('stroke', 'none');
    axisNodes.selectAll('.tick line')
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('stroke', 'lightgray');
  }

  getLine(terms: LineTerms, x: number) {
    const y = terms.slope * x + terms.term;
    if (y >= 0) {
      return [x, y];
    }
    return [-terms.term / terms.slope, 0];
  }

}
