import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {ObservationFilterInterface} from "./observation-filters.interface";
import {Subscription} from "rxjs";
import {TranslateService} from "ng2-translate";

@Component({
  selector: 'laji-observation-filters',
  templateUrl: 'observation-filters.component.html',
  styleUrls: ['observation-filters.component.css']
})
export class ObservationFilterComponent implements OnInit, OnDestroy {
  @Input() filters:ObservationFilterInterface;
  @Output() filtersChange:EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();
  @Output() onSelect:EventEmitter<any> = new EventEmitter();

  public loading:boolean = false;

  private subData: Subscription;
  private subTrans: Subscription;

  constructor(
    private warehouseService:WarehouseApi,
    private searchQuery:SearchQuery,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.update();
    this.searchQuery.queryUpdated$.subscribe(() => this.update());
    if (this.filters.map) {
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

  update() {
    if (!this.filters) {
      return;
    }
    if (this.subData) {
      this.subData.unsubscribe();
    }
    this.loading = true;
    this.subData = this.warehouseService.warehouseQueryAggregateGet(
      this.searchQuery.query,
      [this.filters.field],
      undefined,
      this.filters.size || 20
    ).subscribe(
      data => {
        let filtersData = (data.results || [])
          .filter((result) => {
            if (this.filters.pick) {
              return this.filters.pick.indexOf(result.aggregateBy[this.filters['field']]) > -1
            }
            return true;
          })
          .map((result) => {
            let val = result.aggregateBy[this.filters['field']];
            if (this.filters.valueMap && typeof this.filters.valueMap[val] !== 'undefined') {
              val = this.filters.valueMap[val];
            }
            let sel = this.filters.selected.filter((value) => {
              return value === val;
            }).length > 0;
            return {
              value: val,
              count: result['count'] || 0,
              selected: sel
            };
          });
        if (this.filters.map) {
          this.filters.map(filtersData).subscribe(
            res => this.filters.data = res
          )
        } else {
          this.filters.data = filtersData;
        }
        this.filters.total = data.total;
      },
      err => console.log(err),
      () => this.loading = false
    );
  }

  toggle(item:any) {
    item.selected = !item.selected;
    if (item.selected) {
      this.filters.selected.push(item.value);
    } else {
      this.filters.selected = this.filters.selected.filter(value => {
        return value !== item.value;
      });
    }
    this.filtersChange.emit(this.filters);
    this.onSelect.emit(item);
  }

  isSelected(value):boolean {
    return this.filters.selected && this.filters.selected.indexOf(value) > -1
  }
}
