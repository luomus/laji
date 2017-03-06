import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-nafi-result',
  templateUrl: './nafi-result.component.html',
  styleUrls: ['./nafi-result.component.css']
})
export class NafiResultComponent implements OnInit, OnDestroy {

  collectionId = 'HR.175';
  taxonId;
  time;
  grid;
  page;

  year;
  currentMonth;
  currentYear;
  startMonth = 3;

  private subQuery: Subscription;

  constructor(private route: ActivatedRoute) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.year = now.getFullYear() - 1;
  }

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(params => {
      this.taxonId = params['taxonId'] || '';
      this.time = params['time'] || '1991-01-01/';
      this.grid = params['grid'] || '';
      this.page = +params['page'] || 0;
    });
  }

  ngOnDestroy() {
    this.subQuery.unsubscribe();
  }

}
