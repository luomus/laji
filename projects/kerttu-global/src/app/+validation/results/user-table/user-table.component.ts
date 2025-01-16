import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { IUserStat } from '../../../kerttu-global-shared/models';
import { UserNameTemplateComponent } from '../../../kerttu-global-shared/component/user-name-template.component';

@Component({
  selector: 'bsg-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTableComponent implements OnInit {
  @ViewChild(UserNameTemplateComponent, { static: true }) public userNameTemplate!: UserNameTemplateComponent;

  @Input() data?: IUserStat[] = [];

  columns: DatatableColumn[] = [];
  sorts: { prop: string; dir: 'asc'|'desc' }[] = [{ prop: 'speciesCreated', dir: 'desc' }, { prop: 'speciesValidated', dir: 'desc' }];

  constructor(
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.columns = [
      {
        name: 'userId',
        label: 'results.userTable.name',
        cellTemplate: this.userNameTemplate.userNameTpl,
        sortTemplate: 'label',
        summaryFunc: () => this.translate.instant('results.total')
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
