import { Component, OnInit, OnDestroy, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { ResultService } from '../service/result.service';
import { MapTypes } from '../theme-map/theme-map.component';
import { Subscription } from 'rxjs/Subscription';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';


@Component({
  selector: 'laji-theme-result',
  templateUrl: './theme-result.component.html',
  styleUrls: ['./theme-result.component.css']
})
export class ThemeResultComponent implements OnInit, OnChanges, OnDestroy {

  @Input() query: WarehouseQueryInterface;
  @Input() path = 'nafi';
  @Input() type: MapTypes;
  @Input() tbodyHeight = 400;
  @Input() lang;
  @Output() onNameClick = new EventEmitter<WarehouseQueryInterface>();

  list = [];
  loading = false;
  private current;
  private subQuery: Subscription;

  constructor(
    private resultService: ResultService,
    private toQname: ToQNamePipe
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
    if (!this.query) {
      return;
    }
    const key = JSON.stringify(this.query);
    if (this.current === key) {
      return;
    }
    if (this.subQuery)  {
      this.subQuery.unsubscribe();
    }
    this.current = key;
    this.loading = true;
    this.list = [];
    this.subQuery = this.resultService.getResults(this.query, this.lang)
      .subscribe(data => {
        this.loading = false;
        this.list = data;
      });
  }

  nameClick(uri) {
    const query = JSON.parse(JSON.stringify(this.query));
    query.taxonId = this.toQname.transform(uri);
    this.onNameClick.emit(query);
  }

}
