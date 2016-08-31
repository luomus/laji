import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {ObservationFilterInterface, FilterDataInterface} from "./observation-filters.interface";
import {Subscription} from "rxjs";

@Component({
  selector: 'laji-observation-filters',
  templateUrl: 'observation-filters.component.html',
  styleUrls: ['observation-filters.component.css']
})
export class ObservationFilterComponent implements OnInit {
  @Input() filters:ObservationFilterInterface;
  @Output() filtersChange:EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();
  @Output() onSelect:EventEmitter<any> = new EventEmitter();

  public loading:boolean = false;

  private subData: Subscription;

  constructor(
    private warehouseService:WarehouseApi,
    private searchQuery:SearchQuery
  ) {
  }

  ngOnInit() {
    this.update();
    this.searchQuery.queryUpdated$.subscribe(() => {
      this.update();
    });
  }

  update() {
    if (!this.filters) {
      return;
    }
    if (this.subData) {
      this.subData.unsubscribe();
    }
    this.subData = this.warehouseService.warehouseQueryAggregateGet(
      this.searchQuery.query,
      [this.filters.field],
      undefined,
      this.filters.size || 20
    ).subscribe(
      data => {
        this.filters.data = (data.results || [])
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
        this.filters.total = data.total;
      }
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
