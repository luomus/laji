import { Component, OnInit, OnChanges, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { QualityService } from '../../service/quality.service';
import { Subscription, forkJoin as ObservableForkJoin } from 'rxjs';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { MostActiveUsersTable } from '../model/most-active-users-table';
import * as moment from 'moment';

@Component({
  selector: 'laji-most-active-users-table',
  templateUrl: './most-active-users-table.component.html',
  styleUrls: ['./most-active-users-table.component.css']
})
export class MostActiveUsersTableComponent implements OnInit, OnChanges {
  @Input() maxLength = 50;
  @Input() group = '';

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

  private fetchSub: Subscription;

  constructor(
    private qualityService: QualityService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.group && !changes.group.isFirstChange()) {
      this.getData();
    }
  }

  getData() {
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }

    const observables = [];

    this.tables.map((table) => {
      observables.push(
        this.qualityService.getMostActiveUsers(this.maxLength, this.group, table.date)
      );
    });

    this.fetchSub = ObservableForkJoin(observables)
      .subscribe((results) => {
        results.map((res, i) => {
          this.tables[i].data = res;
        });

        this.loading = false;
        this.cd.markForCheck();
      });
  }
}
