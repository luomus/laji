import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { ResultService } from '../service/result.service';


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
  @Input() tbodyHeight = 400;

  list = [];
  loading = false;

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
    if (!this.informalGroup || !this.collectionId) {
      return;
    }
    this.loading = true;
    this.list = [];
    this.resultService.getResults(this.collectionId, this.informalGroup, this.time)
      .map(data => data.results)
      .subscribe(data => {
        this.loading = false;
        this.list = data;
      });
  }

}
