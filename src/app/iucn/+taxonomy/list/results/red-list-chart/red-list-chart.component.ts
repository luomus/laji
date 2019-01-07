import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Input } from '@angular/core';

const BAR_HEIGHT = 20;

export interface ChartData {
  'name': string;
  'series': {name: string, value: number}[];
}

export interface SimpleChartData {
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

  @Input()
  legend = true;

  @Input()
  label = '';

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
    this.height = data && data[0] && data[0].series ? ((data.length * Math.max(data[0].series.length * BAR_HEIGHT, 30)) + 70) : 0;
    this.resize();
  }

  @HostListener('window:resize', ['$event.target'])
  private resize() {
    this.view = [
      this.el.nativeElement.offsetWidth,
      this.height
    ];
  }

  /* tslint:disable */
  private mock: ChartData[] = [
      {
        'name': 'Juoksujlkaiset',
        'series': [
          {
            'name': '2019',
            'value': 40632
          },
          {
            'name': '2010',
            'value': 36953
          },
          {
            'name': '2005',
            'value': 33953
          }
        ]
      },
      {
        'name': 'Kaksoisjalkaiset',
        'series': [
          {
            'name': '2019',
            'value': 49737
          },
          {
            'name': '2010',
            'value': 45986
          },
          {
            'name': '2005',
            'value': 43986
          }
        ]
      },
      {
        'name': 'Harvajalkaiset',
        'series': [
          {
            'name': '2019',
            'value': 36745
          },
          {
            'name': '2010',
            'value': 34774
          },
          {
            'name': '2005',
            'value': 33774
          }
        ]
      },
      {
        'name': 'Juoksujlkaiset, Chilopoda',
        'series': [
          {
            'name': '2019',
            'value': 36240
          },
          {
            'name': '2010',
            'value': 32543
          },
          {
            'name': '2005',
            'value': 30543
          }
        ]
      },
      {
        'name': 'Kaksoisjalkaiset, Diplopoda',
        'series': [
          {
            'name': '2019',
            'value': 16240
          },
          {
            'name': '2010',
            'value': 10600
          },
          {
            'name': '2005',
            'value': 10000
          }
        ]
      },
      {
        'name': 'Harvajalkaiset, Pauropoda',
        'series': [
          {
            'name': '2019',
            'value': 1240
          },
          {
            'name': '2010',
            'value': 1543
          },
          {
            'name': '2005',
            'value': 1043
          }
        ]
      }
    ];

}
