import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { ResultService } from '../service/result.service';
import { MapTypes } from '../theme-map/theme-map.component';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'laji-theme-result',
  templateUrl: './theme-result.component.html',
  styleUrls: ['./theme-result.component.css']
})
export class ThemeResultComponent implements OnInit, OnChanges, OnDestroy {

  @Input() path = 'nafi';
  @Input() collectionId: string;
  @Input() informalGroup: string;
  @Input() time = '1991-01-01/';
  @Input() type: MapTypes;
  @Input() tbodyHeight = 400;
  @Input() lang;

  list = [];
  loading = false;
  private subQuery: Subscription;

  constructor(
    private resultService: ResultService
  ) { }

  ngOnInit() {
    this.initList();
  }

  ngOnDestroy() {
  }

  ngOnChanges() {
    this.initList();
  }

  initList() {
    if (!this.informalGroup || !this.collectionId || !this.lang) {
      return;
    }
    if (this.subQuery)  {
      this.subQuery.unsubscribe();
    }
    this.loading = true;
    this.list = [];
    this.subQuery = this.resultService.getResults(this.collectionId, this.informalGroup, this.time, this.lang)
      .subscribe(data => {
        this.loading = false;
        this.list = data;
      });
  }

}
