import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { IColumns } from '../../../datatable/service/observation-table-column.service';
import { TableColumnService } from '../../../datatable/service/table-column.service';
import { ObservationTableColumn } from '../../../observation-result/model/observation-table-column';
import { ObservationVisualizationMode } from '../observation-visualization';

const obsVizToColName: Record<ObservationVisualizationMode, keyof IColumns> = {
  obsCount: 'count',
  individualCount: 'unit.interpretations.individualCount',
  recordAge: 'newestRecord',
  recordQuality: 'unit.interpretations.recordQuality',
  redlistStatus: 'unit.linkings.taxon.latestRedListStatusFinland'
};

const defaultColumnNames: (keyof IColumns)[] = [
  'unit.interpretations.recordQuality',
  'document.linkings.collectionQuality',
  'unit.taxon',
  'gathering.displayDateTime',
  'gathering.team.memberName',
  'count'
];

@Component({
  selector: 'laji-observation-cluster-table',
  templateUrl: './observation-cluster-table.component.html',
  styleUrls: ['./observation-cluster-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
  export class ObservationClusterTableComponent implements OnInit, OnChanges {
  @Input() data;
  @Input() visualizationMode: ObservationVisualizationMode = 'obsCount';
  columns: ObservationTableColumn[] = [];
  rows: any[] = [];

  constructor(
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>
  ) {}

  ngOnInit(): void {
    //const selected: string[] = JSON.parse(localStorage.getItem('laji-users-global-settings'))?.resultList?.selected || this.tableColumnService.getDefaultFields();
    this.updateColumns([...defaultColumnNames, obsVizToColName[this.visualizationMode]]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.rows = this.data.map(f => ({
        unit: {
          linkings: {
            taxon: f.properties.taxon
          }
        }
      }));
    }
    if (changes.visualizationMode) {
      this.updateColumns([...defaultColumnNames, obsVizToColName[this.visualizationMode]]);
    }
  }

  private updateColumns(columnNames: (keyof IColumns)[]) {
    this.columns = this.tableColumnService.getAllColumns().filter(c => columnNames.includes(c.name));
  }
}
