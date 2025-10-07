import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { IIdentificationUserStatResult } from '../../../../kerttu-global-shared/models';
import { UserNameTemplateComponent } from '../../../../kerttu-global-shared/component/user-name-template.component';

@Component({
  selector: 'bsg-identification-user-table',
  templateUrl: './identification-user-table.component.html',
  styleUrls: ['./identification-user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationUserTableComponent implements OnInit {
  @ViewChild(UserNameTemplateComponent, { static: true }) public userNameTemplate!: UserNameTemplateComponent;

  @Input() data?: IIdentificationUserStatResult = { results: [], totalDistinctSpeciesCount: 0 };

  columns: DatatableColumn[] = [];

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
        name: 'distinctSpeciesCount',
        label: 'results.userTable.distinctSpeciesCount',
        width: 70,
        summaryFunc: () => this.data?.totalDistinctSpeciesCount
      },
      {
        name: 'drawnBoxesCount',
        label: 'results.userTable.drawnBoxesCount',
        width: 70
      }
    ];
  }
}
