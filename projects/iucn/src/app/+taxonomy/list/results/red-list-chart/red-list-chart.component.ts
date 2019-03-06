import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

const BAR_HEIGHT = 20;

export interface ChartData {
  'id'?: string;
  'name': string;
  'series': {name: string, value: number}[];
}

export interface SimpleChartData {
  'id': string;
  'name': string;
  'value': number;
}

@Component({
  selector: 'laji-red-list-chart',
  templateUrl: './red-list-chart.component.html',
  styleUrls: ['./red-list-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListChartComponent implements AfterViewInit {

  _data: ChartData[] = [];
  view: [number, number];
  height: number;

  @Input() primaryColor = '#d62022';
  @Input() secondaryColor = '#888';

  @Input()
  legend = true;

  @Input()
  label = '';

  @Output() select = new EventEmitter<string>();

  colorSchema: {name: string, value: string}[] = [];

  constructor(
    private el: ElementRef
  ) { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resize();
    }, 100);
  }

  @Input()
  set data(data: ChartData[]) {
    this._data = data;
    if (data && data[0] && data[0].series) {
      this.height = (data.length * Math.max(data[0].series.length * BAR_HEIGHT, 30)) + 70;
      this.colorSchema = [
        {
          name: data[0].series[0].name,
          value: this.primaryColor
        },
        {
          name: data[0].series[1].name,
          value: this.secondaryColor
        }
      ];
    } else {
      this.height = 0;
    }
    this.resize();
  }

  @HostListener('window:resize', ['$event.target'])
  private resize() {
    this.view = [
      this.el.nativeElement.offsetWidth,
      this.height
    ];
  }

  itemSelect(event) {
    const idx = this._data.findIndex(val => val.name === event.series);
    if (idx === -1) {
      return;
    }
    this.select.emit(this._data[idx].id);
  }
}
