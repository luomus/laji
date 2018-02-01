import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { QualityService } from '../../service/quality.service';
import { Observable } from 'rxjs/Observable';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { MostActiveUsersTable } from '../model/most-active-users-table';

@Component({
  selector: 'laji-most-active-users-table',
  templateUrl: './most-active-users-table.component.html',
  styleUrls: ['./most-active-users-table.component.css']
})
export class MostActiveUsersTableComponent implements OnInit {
  @Input() maxLength = 50;

  tables: MostActiveUsersTable[] = [
    { prop: 'sevenDays', date: moment().subtract(1, 'week').format('YYYY-MM-DD') },
    { prop: 'year', date: moment().subtract(1, 'year').format('YYYY-MM-DD') },
    { prop: 'allTime'}
  ];

  columns: DatatableColumn[] = [
    { prop: 'userId', cellTemplate: 'fullUser' },
    { prop: 'count' }
  ];

  loading = true;

  constructor(
    private qualityService: QualityService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const observables = [];

    this.tables.map((table) => {
      observables.push(
        this.qualityService.getMostActiveUsers(this.maxLength, table.date)
      );
    });

    Observable.forkJoin(observables)
      .subscribe((results) => {
        results.map((res, i) => {
          this.tables[i].data = res;
        });

        this.loading = false;
        this.cd.markForCheck();
      });
  }
}
