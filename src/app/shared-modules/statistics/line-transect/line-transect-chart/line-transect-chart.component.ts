import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges,
  OnDestroy
} from '@angular/core';
import { ScriptService } from '../../../../shared/service/script.service';

declare const d3: any;

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
  @Input() line: number[][];
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
  private d3Loaded = false;

  // Add stuff here from createChart() that need to be updated dynamically.
  // TODO transition animations
  private updates = {
    'axis axis-y': () => this.chart.append('g')
      .call(d3.svg.axis().scale(this.yScale).orient('left')),
    '_grid-lines': () => {
      const yGridlinesAxis = d3.svg.axis().scale(this.yScale).orient('left');
      const yGridlineNodes = this.chart.append('g')
        .call(yGridlinesAxis.tickSize(-this.width, 0, 0).tickFormat(''));
      this.styleGridlineNodes(yGridlineNodes);
      return yGridlineNodes;
    },
    'line-data': () => {
      if (!this.line) {
        return;
      }
      const line = d3.svg.line()
        .x(([column]) => this.xScale(column))
        .y(([column, value]) => this.yScale(value));
      return this.chart.append('path')
        .attr({
          'fill': 'none',
          'stroke': 'steelblue',
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
          'stroke-width': 1.5,
          'd': line(this.line)
        });
    }
  };

  constructor(
    element: ElementRef,
    private scriptService: ScriptService,
    private cd: ChangeDetectorRef
  ) {
    this.nativeElement = element.nativeElement;
  }

  ngAfterViewInit() {
    this.scriptService.load('d3')
      .then(
        () => {
          this.d3Loaded = true;
          this.createChart();
          if (this.yValue && this.xValue || this.line) {
            this.updateChart();
          }
          this.cd.markForCheck();
        }
      )
      .catch((err) => console.log(err));
  }

  ngOnChanges() {
    if (this.d3Loaded && this.chart) {
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
    const svg = this.svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);
    const g = svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'drawing')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // create scales
    this.xScale = d3.scale.linear().domain([this.xRange[0], this.xRange[1]]).range([0, this.width]);
    this.yScale = d3.scale.linear().domain([this.yRange[1], this.yRange[0]]).range([0, this.height]);

    // create guide lines
    const line = d3.svg.line()
      .x((d) => this.xScale(d[0]) + this.margin.left)
      .y((d) => this.yScale(d[1]) + this.margin.top);

    if (this.terms) {
      svg.append('path')
        .datum([this.getLine(this.terms.upper, this.xRange[0]), this.getLine(this.terms.upper, this.xRange[1])])
        .attr({d: line, stroke: 'red', 'stroke-dasharray': '7,7', 'stroke-width': 2, fill: 'none'});

      svg.append('path')
        .datum([this.getLine(this.terms.lower, this.xRange[0]), this.getLine(this.terms.lower, this.xRange[1])])
        .attr({d: line, stroke: 'red', 'stroke-dasharray': '7,7', 'stroke-width': 2, fill: 'none'});


      svg.append('path')
        .datum([this.getLine(this.terms.middle, this.xRange[0]), this.getLine(this.terms.middle, this.xRange[1])])
        .attr({d: line, stroke: 'black', 'stroke-width': 2, fill: 'none'});
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
    const svgXAxis = d3.svg.axis().scale(this.xScale).orient('bottom');
    if (this.xTickFormat) {
      svgXAxis.tickFormat(d3.format(this.xTickFormat));
    }
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left},${(this.height + this.margin.top)})`)
      .call(svgXAxis);
  }

  updateChart() {
    this.yScale = d3.scale.linear().domain([this.yRange[1], this.yRange[0]]).range([0, this.height]);
    Object.keys(this.updates).forEach(className => {
      const fn = this.updates[className];
      let update = this.chart.selectAll(className.split(' ').map(s => `.${s}`).join(''));
      if (update) {
        if (update.exit) { update = update.exit(); }
        update.remove();
      }
      const svg = fn();
      svg && svg.attr('class', className);
    });

    if (this.xValue && this.yValue) {
      const update = this.chart.selectAll('.mark')
        .data([[this.xValue, this.yValue]]);

      // remove exiting point
      update.exit().remove();

      // update existing point
      this.chart.selectAll('.mark').transition()
        .attr({
          cx: (d) => this.xScale(d[0]),
          cy: (d) => this.yScale(d[1])
        });

      // add new pint
      update
        .enter()
        .append('circle')
        .attr({
          'class': 'mark',
          cx: (d) => this.xScale(d[0]),
          cy: (d) => this.yScale(d[1]),
          r: 3,
          fill: 'red',
          stroke: 'black'
        });
    }
  }

  styleGridlineNodes(axisNodes) {
    axisNodes.selectAll('.domain')
      .attr({
        fill: 'none',
        stroke: 'none'
      });
    axisNodes.selectAll('.tick line')
      .attr({
        fill: 'none',
        'stroke-width': 1,
        stroke: 'lightgray'
      });
  }

  getLine(terms: LineTerms, x: number) {
    const y = terms.slope * x + terms.term;
    if (y >= 0) {
      return [x, y];
    }
    return [-terms.term / terms.slope, 0];
  }

}
