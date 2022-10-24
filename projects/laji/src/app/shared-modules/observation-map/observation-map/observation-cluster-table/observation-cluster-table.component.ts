import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit
} from '@angular/core';
import { IColumns } from '../../../datatable/service/observation-table-column.service';
import { TableColumnService } from '../../../datatable/service/table-column.service';
import { ObservationTableColumn } from '../../../observation-result/model/observation-table-column';

@Component({
  selector: 'laji-observation-cluster-table',
  templateUrl: './observation-cluster-table.component.html',
  styleUrls: ['./observation-cluster-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
  export class ObservationClusterTableComponent implements OnInit, OnChanges {
  @Input() data;
  columns: ObservationTableColumn[] = [];
  rows: any[] = [];

  constructor(
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>
  ) {}

  ngOnInit(): void {
    const selected: string[] = JSON.parse(localStorage.getItem('laji-users-global-settings')).resultList.selected;
    this.columns = this.tableColumnService.getAllColumns().filter(c => selected.includes(c.name));
  }

  ngOnChanges() {
    this.rows = this.data.map(f => ({
      unit: {
        linkings: {
          taxon: f.properties.taxon
        }
      }
    }));
  }
}
