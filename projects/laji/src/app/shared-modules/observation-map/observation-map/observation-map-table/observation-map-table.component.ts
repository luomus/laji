import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { WarehouseQueryInterface } from 'projects/laji/src/app/shared/model/WarehouseQueryInterface';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IColumns } from '../../../datatable/service/observation-table-column.service';
import { TableColumnService } from '../../../datatable/service/table-column.service';
import { DocumentViewerFacade } from '../../../document-viewer/document-viewer.facade';
import { ObservationTableColumn } from '../../../observation-result/model/observation-table-column';
import { getSortsFromCols } from '../../../observation-result/observation-table/observation-table.component';
import { ObservationVisualizationMode } from '../observation-visualization';

export interface Coordinates {
  type: 'wgs84' | 'ykj';
  coordinates?: [number, number];
  square?: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
}

const defaultColumnNames: (keyof IColumns)[] = [
  'unit.interpretations.recordQuality',
  'document.linkings.collectionQuality',
  'unit.taxon',
  'gathering.displayDateTime',
  'gathering.team',
  'unit.abundanceString',
  'gathering.interpretations.coordinateAccuracy'
];

const visualizationModeColNames = {
  individualCount: ['unit.interpretations.individualCount'],
  redlistStatus: ['unit.linkings.taxon.latestRedListStatusFinland']
};

@Component({
  selector: 'laji-observation-map-table',
  templateUrl: './observation-map-table.component.html',
  styleUrls: ['./observation-map-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
  export class ObservationMapTableComponent implements OnInit, OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() coordinates: Coordinates;
  @Input() visualizationMode: ObservationVisualizationMode = 'obsCount';
  columns: ObservationTableColumn[] = [];
  rows$: Observable<any>;
  loading = false;
  pageSize = 100;
  initialized = false;

  private columnLookup: any;
  private orderBy: string[] = [];

  constructor(
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>,
    private warehouse: WarehouseApi,
    private cdr: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade,
    private translate: TranslateService
  ) {
    this.columnLookup = this.tableColumnService.getAllColumnLookup();
  }

  ngOnInit(): void {
    this.updateRows();
    this.updateColumns();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.initialized) { return; }
    if (changes.coordinates) {
      this.updateRows();
    }
    if (changes.query) {
      this.updateRows();
    }
    if (changes.visualizationMode) {
      this.updateColumns();
    }
  }

  onRowSelect(event) {
    const row = event.row || {};
    if (row.document?.documentId && row.unit?.unitId) {
      this.documentViewerFacade.showDocumentID({
        document: row.document.documentId,
        highlight: row.unit.unitId,
        openAnnotation: false,
        own: false,
        result: undefined
      });
    }
  }

  onPageChange(event) {
    this.updateRows(event.page);
  }

  onServerSort(event) {
    this.orderBy = getSortsFromCols(event, this.columns, this.translate.currentLang);
    this.updateRows();
  }

  private updateRows(page: number = 1) {
    const selected = [
      'unit.interpretations.recordQuality',
      'document.linkings.collectionQuality',
      'unit',
      'unit.abundanceString',
      'gathering.displayDateTime',
      'gathering.team',
      'document.documentId',
      'unit.interpretations.individualCount',
      'unit.linkings.taxon.latestRedListStatusFinland.status',
      'unit.linkings.taxon.latestRedListStatusFinland.year',
      'gathering.interpretations.coordinateAccuracy'
    ];
    const query: WarehouseQueryInterface = { ...this.query };
    if (this.coordinates.type === 'wgs84') {
      if (this.coordinates.square) {
        query['wgs84CenterPoint'] = this.coordinates.square.latMin
          + ':' + this.coordinates.square.latMax
          + ':'+ this.coordinates.square.lonMin
          + ':' + this.coordinates.square.lonMax + ':WGS84';
      } else {
        query['wgs84CenterPoint'] = this.coordinates.coordinates[1]
          + ':' +  this.coordinates.coordinates[0] + ':WGS84';
      }
    } else {
      const ykj = this.coordinates.coordinates[0] + ':' + this.coordinates.coordinates[1];
      query['ykj10kmCenter'] = ykj;
    }
    this.loading = true;
    this.rows$ = this.warehouse.warehouseQueryListGet(query, selected, this.orderBy, this.pageSize, page).pipe(
      tap(d => {
        this.loading = false;
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      })
    );
    this.cdr.detectChanges();
  }

  private updateColumns() {
    const colNames = [...defaultColumnNames, ...visualizationModeColNames[this.visualizationMode] || []];
    this.columns = colNames.map(colName => this.columnLookup[colName]);
    this.cdr.markForCheck();
  }
}
