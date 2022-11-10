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

const obsVizToColProp: Record<ObservationVisualizationMode, keyof IColumns> = {
  obsCount: 'count',
  individualCount: 'unit.interpretations.individualCount',
  recordAge: 'newestRecord',
  recordQuality: 'unit.interpretations.recordQuality',
  redlistStatus: 'unit.linkings.taxon.latestRedListStatusFinland'
};

const defaultColumnProps: (keyof IColumns)[] = [
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

  constructor(
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>,
    private warehouse: WarehouseApi,
    private cdr: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade
  ) {}

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
    //const selected: string[] = this.columns.map(col => col.selectField || <string>col.prop || col.name);
    const selected = [
      'unit.interpretations.recordQuality',
      'document.linkings.collectionQuality',
      'unit',
      'unit.abundanceString',
      'gathering.displayDateTime',
      'gathering.team',
      'document.documentId'
    ];
/*     const selected = [
      'unit.interpretations.recordQuality',
      'document.linkings.collectionQuality',
      'unit.linkings.taxon.taxonomicOrder',
      'unit',
      'unit.abundanceString',
      'gathering.displayDateTime',
      'gathering.interpretations.countryDisplayname',
      'gathering.interpretations.biogeographicalProvinceDisplayname',
      'gathering.locality',
      'document.collectionId',
      'document.documentId',
      'gathering.team',
      'unit.unitId',
      'document.documentId'
    ]; */
    this.rows$ = this.warehouse.warehouseQueryListGet({
      wgs84CenterPoint: wgs,
      coordinateAccuracyMax: 5000
    }, selected /* , <string[]>[...defaultColumnProps, ...Object.values(obsVizToColProp)] */).pipe(
      map(d => d.results),
      tap(() => {
        setTimeout(() => {
          this.cdr.markForCheck(); this.cdr.detectChanges();
        });
      })
    );
    this.cdr.markForCheck();
  }

  private updateColumns() {
    const names = [...defaultColumnProps/* , obsVizToColProp[this.visualizationMode] */];
    // TODO fix order
    this.columns = this.tableColumnService.getAllColumns().filter(c => names.includes(c.name));
  }
}
