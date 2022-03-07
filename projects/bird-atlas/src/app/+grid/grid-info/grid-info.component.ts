import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import LajiMap, { TileLayerName } from 'laji-map';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';

interface DatatableRow {
  order: number;
  species: string;
  index: string;
  class: string;
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

  rows: DatatableRow[] = [
    {
      order: 0,
      species: 'Kanadanhanhi',
      index: 'Indeksi',
      class: 'Luokka'
    },
    {
      order: 1,
      species: 'Kyhmyjoutsen',
      index: 'Indeksi2',
      class: 'Luokka2'
    }
  ];
  cols: TableColumn[] = [
    {
      prop: 'order',
      name: '#',
      resizeable: false,
      sortable: true
    },
    {
      prop: 'species',
      name: 'Laji',
      resizeable: false,
      sortable: true
    },
    {
      prop: 'index',
      name: 'Indeksi',
      resizeable: false,
      sortable: true
    },
    {
      prop: 'class',
      name: 'Luokka',
      resizeable: false,
      sortable: true
    }
  ];
  datatableClasses = datatableClasses;
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
