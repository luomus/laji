import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { IIdentificationUserStat } from '../../../kerttu-global-shared/models';
import { UserNameTemplateComponent } from '../../../kerttu-global-shared/component/user-name-template.component';

@Component({
  selector: 'bsg-identification-user-table',
  templateUrl: './identification-user-table.component.html',
  styleUrls: ['./identification-user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationUserTableComponent implements OnInit {
  @ViewChild(UserNameTemplateComponent, { static: true }) public userNameTemplate: UserNameTemplateComponent;

  @Input() data: IIdentificationUserStat[] = [];

  columns: DatatableColumn[] = [];
  sorts: { prop: string; dir: 'asc'|'desc' }[] = [
    { prop: 'annotationCount', dir: 'desc' },
    { prop: 'speciesCount', dir: 'desc' },
    { prop: 'drawnBoxesCount', dir: 'desc' }
   ];

  @ViewChild('userName', { static: true }) userNameTpl: TemplateRef<any>;

  constructor(
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.columns = [
      {
        name: 'userId',
        label: 'theme.kerttu.result.name',
        cellTemplate: this.userNameTemplate.userNameTpl,
        sortTemplate: 'label',
        summaryFunc: () => this.translate.instant('theme.total')
      },
      {
        name: 'annotationCount',
        label: 'results.userTable.annotationCount',
        width: 70
      },
      {
        name: 'speciesCount',
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
