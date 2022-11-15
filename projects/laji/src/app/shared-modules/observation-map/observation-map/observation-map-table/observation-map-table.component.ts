import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { map, tap } from 'rxjs/operators';
import { IColumns } from '../../../datatable/service/observation-table-column.service';
import { TableColumnService } from '../../../datatable/service/table-column.service';
import { DocumentViewerFacade } from '../../../document-viewer/document-viewer.facade';
import { ObservationTableColumn } from '../../../observation-result/model/observation-table-column';
import { ObservationVisualizationMode } from '../observation-visualization';

const defaultColumnNames: (keyof IColumns)[] = [
  'unit.interpretations.recordQuality',
  'document.linkings.collectionQuality',
  'unit.taxon',
  'gathering.displayDateTime',
  'gathering.team',
  'unit.abundanceString'
];

@Component({
  selector: 'laji-observation-map-table',
  templateUrl: './observation-map-table.component.html',
  styleUrls: ['./observation-map-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
  export class ObservationMapTableComponent implements OnInit, OnChanges {
  @Input() coordinates: [number, number];
  @Input() visualizationMode: ObservationVisualizationMode = 'obsCount';
  columns: ObservationTableColumn[] = [];
  rows$;
  loading = false;

  private columnLookup: any;

  constructor(
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>,
    private warehouse: WarehouseApi,
    private cdr: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade
  ) {
    this.columnLookup = this.tableColumnService.getAllColumnLookup();
  }

  ngOnInit(): void {
    this.updateRows();
    this.updateColumns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.coordinates) {
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
        own: false /* query && (!!query.observerPersonToken || !!query.editorPersonToken || !!query.editorOrObserverPersonToken) */,
        result: undefined
      });
    }
  }

  private updateRows() {
    const wgs = this.coordinates[1] + ':' +  this.coordinates[0] + ':WGS84';
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
      'unit.linkings.taxon.latestRedListStatusFinland.year'
    ];
    this.loading = true;
    this.rows$ = this.warehouse.warehouseQueryListGet({
      wgs84CenterPoint: wgs
    }, selected).pipe(
      map(d => d.results),
      tap(() => {
        this.loading = false;
        setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      })
    );
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private updateColumns() {
    const colNames = [...defaultColumnNames];
    switch (this.visualizationMode) {
      case 'individualCount':
        colNames.push('unit.interpretations.individualCount');
        break;
      case 'redlistStatus':
        colNames.push('unit.linkings.taxon.latestRedListStatusFinland');
        break;
      case 'obsCount':
      case 'recordAge':
      case 'recordQuality':
        break;
    }
    this.columns = colNames.map(colName => this.columnLookup[colName]);
    this.cdr.markForCheck();
  }
}
