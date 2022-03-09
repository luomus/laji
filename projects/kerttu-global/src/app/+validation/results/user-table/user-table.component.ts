import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { IUserStat } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTableComponent implements OnInit {
  @Input() userId?: string;
  @Input() data: IUserStat[] = [];

  columns: DatatableColumn[] = [];
  sorts: { prop: string, dir: 'asc'|'desc' }[] = [{ prop: 'speciesCreated', dir: 'desc' }, { prop: 'speciesValidated', dir: 'desc' }];

  @ViewChild('userName', { static: true }) userNameTpl: TemplateRef<any>;

  constructor(
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.columns = [
      {
        name: 'userId',
        label: 'theme.kerttu.result.name',
        cellTemplate: this.userNameTpl,
        sortTemplate: 'label',
        summaryFunc: () => this.translate.instant('theme.total')
      },
      {
        name: 'speciesCreated',
        label: 'results.userTable.speciesCreated',
        width: 70
      },
      {
        name: 'speciesValidated',
        label: 'results.userTable.speciesValidated',
        width: 70
      }
    ];
  }
}
