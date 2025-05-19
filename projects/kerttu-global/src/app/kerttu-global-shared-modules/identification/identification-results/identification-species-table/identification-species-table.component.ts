import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { IIdentificationSpeciesStat } from '../../../../kerttu-global-shared/models';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'bsg-identification-species-table',
  templateUrl: './identification-species-table.component.html',
  styleUrls: ['./identification-species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationSpeciesTableComponent implements OnInit {
  @Input() data: IIdentificationSpeciesStat[] = [];
  @Input() filterBy = '';

  columns: DatatableColumn[] = [];

  constructor(
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.columns = [
      {
        name: 'commonName',
        label: 'speciesList.column.commonName',
        summaryFunc: () => this.translate.instant('results.total')
      },
      {
        name: 'scientificName',
        label: 'speciesList.column.scientificName'
      },
      {
        name: 'count',
        label: 'results.userTable.speciesCount',
        width: 70
      },
      {
        name: 'drawnBoxesCount',
        label: 'results.userTable.drawnBoxesCount',
        width: 70
      }
    ];
  }
}
