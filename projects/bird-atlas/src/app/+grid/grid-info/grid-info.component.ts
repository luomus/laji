import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import LajiMap from 'laji-map';

interface DatatableRow {
  num: number;
  species: string;
}

@Component({
  selector: 'ba-grid-info',
  templateUrl: './grid-info.component.html',
  styleUrls: ['./grid-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridInfoComponent implements AfterViewInit {
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
      name: 'Suurin atlasCode'
    },
    {
      prop: 'species',
      name: 'Suurin atlasClass'
    }
  ];
  map: any;

  constructor(private translate: TranslateService, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.map = new LajiMap({
        rootElem: this.elemRef.nativeElement
      });
    });
  }
}
