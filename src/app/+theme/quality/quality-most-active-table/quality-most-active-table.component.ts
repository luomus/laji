import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { QualityService } from '../quality.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'laji-quality-most-active-table',
  templateUrl: './quality-most-active-table.component.html',
  styleUrls: ['./quality-most-active-table.component.css']
})
export class QualityMostActiveTableComponent implements OnInit {
  @Input() maxLength = 50

  tables = [
    {prop: 'sevenDays', date: moment().subtract(1, 'week').toDate(), data: []},
    {prop: 'year', date: moment().subtract(1, 'year').toDate(), data: []},
    {prop: 'allTime', date: null, data: []}
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
        this.qualityService.getMostActiveUsers(this.maxLength, table['date'])
          .do(res => {
            table['data'] = res;
          })
      );
    });

    Observable.forkJoin(observables)
      .subscribe(() => {
        this.loading = false;
        this.cd.markForCheck();
      });
  }
}
