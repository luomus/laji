import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {ObservationFilterInterface} from "./observation-filter.interface";
import {Subscription} from "rxjs";
import {TranslateService} from "ng2-translate";


@Component({
  selector: 'laji-observation-filter',
  templateUrl: 'observation-filter.component.html',
  styleUrls: ['observation-filter.component.css']
})
export class ObservationFilterComponent implements OnInit, OnDestroy {
  @Input() filter:ObservationFilterInterface;
  @Output() filterChange:EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();
  @Output() onSelect:EventEmitter<any> = new EventEmitter();

  public loading:boolean = false;
  public page:number = 1;
  public total:number = 0;

  private subData: Subscription;
  private subTrans: Subscription;
  private lastQuery:string;

  constructor(
    private warehouseService:WarehouseApi,
    private searchQuery:SearchQuery,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.init();
    this.searchQuery.queryUpdated$.subscribe(() => this.init());
    if (this.filter.map) {
      this.subTrans = this.translate.onLangChange.subscribe(() => this.update())
    }
  }

  ngOnDestroy() {
    if (this.subData) {
      this.subData.unsubscribe();
    }
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
  }

  init() {
    this.page = 1;
    this.total = 0;
    this.update()
  }

  update() {
    if (!this.filter) {
      return;
    }
    let cacheKey = JSON.stringify(this.searchQuery.query) + this.page;
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;
    if (this.subData) {
      this.subData.unsubscribe();
    }
    this.loading = true;
    this.subData = this.warehouseService.warehouseQueryAggregateGet(
      this.searchQuery.query,
      [this.filter.field],
      undefined,
      this.filter.size,
      this.page
    ).subscribe(
      data => {
        this.total = data.total || 0;
        let filtersData = (data.results || [])
          .filter((result) => {
            if (this.filter.pick) {
              return this.filter.pick.indexOf(result.aggregateBy[this.filter['field']]) > -1
            }
            return true;
          })
          .map((result) => {
            let val = result.aggregateBy[this.filter['field']];
            if (this.filter.valueMap && typeof this.filter.valueMap[val] !== 'undefined') {
              val = this.filter.valueMap[val];
            }
            let sel = this.filter.selected.filter((value) => {
              return value === val;
            }).length > 0;
            return {
              value: val,
              count: result['count'] || 0,
              selected: sel
            };
          });
        if (this.filter.map) {
          this.filter.map(filtersData).subscribe(
            res => this.filter.data = res
          )
        } else {
          this.filter.data = filtersData;
        }
        this.filter.total = data.total;
      },
      err => console.log(err),
      () => this.loading = false
    );
  }

  toggle(item:any) {
    item.selected = !item.selected;
    if (item.selected) {
      this.filter.selected.push(item.value);
    } else {
      this.filter.selected = this.filter.selected.filter(value => {
        return value !== item.value;
      });
    }
    this.filterChange.emit(this.filter);
    this.onSelect.emit(item);
  }

  showPager():boolean {
    return this.filter.pager && (this.total > this.filter.size)
  }

  pageChanged(page) {
    console.log(page);
    this.page = page.page;
    this.update();
  }
}
