import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy } from '@angular/core';

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
  template: `<div class="line-chart"></div>`,
  styleUrls: ['./line-transect-chart.component.css']
})
export class LineTransectChartComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() ykj3: number;
  @Input() value: number;
  @Input() terms: LineTransectChartTerms;
  @Input() xRange: [number, number] = [660, 780];
  @Input() yRange: [number, number] = [0, 100];
  private nativeElement: any;
  private svg: any;
  private margin: any = { top: 10, bottom: 20, left: 30, right: 10};
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private xAxis: any;
  private yAxis: any;

  constructor(element: ElementRef) {
    this.nativeElement = element.nativeElement;
  }

  ngAfterViewInit() {
    this.createChart();
    if (this.value && this.ykj3) {
      this.updateChart();
    }
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

    // grid lines
    const yGridlinesAxis = d3.svg.axis().scale(this.yScale).orient('left');
    const yGridlineNodes = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .call(yGridlinesAxis.tickSize(-this.width, 0, 0).tickFormat(''));
    this.styleGridlineNodes(yGridlineNodes);

    // create guide lines
    const line = d3.svg.line()
      .x((d) => this.xScale(d[0]) + this.margin.left)
      .y((d) => this.yScale(d[1]) + this.margin.top);

    svg.append('path')
      .datum([this.getLine(this.terms.upper, this.xRange[0]), this.getLine(this.terms.upper, this.xRange[1])])
      .attr({d: line, stroke: 'red', 'stroke-dasharray': '7,7', 'stroke-width': 2, fill: 'none' });

    svg.append('path')
      .datum([this.getLine(this.terms.lower, this.xRange[0]), this.getLine(this.terms.lower, this.xRange[1])])
      .attr({d: line, stroke: 'red', 'stroke-dasharray': '7,7', 'stroke-width': 2, fill: 'none' });


    svg.append('path')
      .datum([this.getLine(this.terms.middle, this.xRange[0]), this.getLine(this.terms.middle, this.xRange[1])])
      .attr({d: line, stroke: 'black', 'stroke-width': 2, fill: 'none' });

    // x & y axis
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left},${(this.height + this.margin.top)})`)
      .call(d3.svg.axis().scale(this.xScale).orient('bottom'));

    this.yAxis = svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.svg.axis().scale(this.yScale).orient('left'));

  }

  updateChart() {
    const update = this.chart.selectAll('.mark')
      .data([[this.ykj3, this.value]]);

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
      .attr({
        'class': 'mark',
        cx: (d) => this.xScale(d[0]),
        cy: (d) => this.yScale(d[1]),
        r: 3,
        fill: 'red',
        stroke: 'black'
      });
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
