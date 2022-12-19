import {Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, TemplateRef} from '@angular/core';
import {UserNameTemplateComponent} from '../../../kerttu-global-shared/component/user-name-template.component';
import {IIdentificationSpeciesStat, IIdentificationUserStatResult} from '../../../kerttu-global-shared/models';
import {DatatableColumn} from '../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'bsg-identification-species-table',
  templateUrl: './identification-species-table.component.html',
  styleUrls: ['./identification-species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationSpeciesTableComponent implements OnInit {
  @Input() data: IIdentificationSpeciesStat[] = [];

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
