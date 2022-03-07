import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import LajiMap, { TileLayerName } from 'laji-map';

interface DatatableRow {
  num: number;
  species: string;
}

const testData = [
  {
    featureCollection: {
      features: [
        {
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [24, 60],
                [25, 60],
                [25, 61]
              ]
            ]
          },
          properties: {},
          type: 'Feature'
        }
      ],
      type: 'FeatureCollection'
    },
    getFeatureStyle: () => ({
      weight: 5,
      opacity: 1,
      fillOpacity: 0.3,
      color: '#00aa00'
    })
  }
];

@Component({
  selector: 'ba-grid-info',
  templateUrl: './grid-info.component.html',
  styleUrls: ['./grid-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lajiMap', { static: true }) elemRef: ElementRef;

  rows: DatatableRow[] = [];
  cols: TableColumn[] = [
    {
      prop: 'num',
      name: '#'
    },
    {
      prop: 'species',
      name: 'Laji'
    },
    {
      prop: 'species',
      name: 'Indeksi'
    },
    {
      prop: 'species',
      name: 'Luokka'
    }
  ];
  map: any;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.map = new LajiMap({
        rootElem: this.elemRef.nativeElement,
        tileLayerName: TileLayerName.maastokartta,
        data: testData,
        zoomToData: true
      });
    });
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.destroy(); }
  }
}
