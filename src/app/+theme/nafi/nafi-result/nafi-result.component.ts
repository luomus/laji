import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

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
  type;
  lang;

  year;
  currentMonth;
  currentYear;
  startMonth = 3;

  private subTrans: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.year = now.getFullYear() - 1;
  }

  ngOnInit() {
    this.lang = this.translate.currentLang;
    this.subTrans = this.translate.onLangChange.subscribe(res => {
      this.lang = res.lang;
    });
    this.subQuery = this.route.queryParams.subscribe(params => {
      this.taxonId = params['taxonId'] || '';
      this.time = params['time'] || '1991-01-01/';
      this.grid = params['grid'] || '';
      this.type = params['type'] || 'count';
      this.page = +params['page'] || 1;
    });
  }

  ngOnDestroy() {
    this.subQuery.unsubscribe();
    this.subTrans.unsubscribe();
  }

}
