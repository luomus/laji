import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, TemplateRef } from '@angular/core';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { TranslateService } from '@ngx-translate/core';
import { IUserStatistics } from '../../models';

@Component({
  selector: 'laji-kerttu-user-table',
  templateUrl: './kerttu-user-table.component.html',
  styleUrls: ['./kerttu-user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuUserTableComponent implements OnInit {
  @Input() userId: string;
  @Input() userList: IUserStatistics[] = [];

  columns: DatatableColumn[] = [];
  sorts: {prop: string; dir: 'asc'|'desc'}[] = [{prop: 'totalAnnotationCount', dir: 'desc'}];
  loading = false;

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
        name: 'letterAnnotationCount',
        label: 'theme.kerttu.result.letters',
        width: 70
      },
      {
        name: 'recordingAnnotationCount',
        label: 'theme.kerttu.result.recordings',
        width: 70
      },
      {
        name: 'totalAnnotationCount',
        label: 'theme.total',
        width: 70
      }
    ];
  }
}
