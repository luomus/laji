import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {SearchQuery} from "../search-query.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'laji-observation-active',
  templateUrl: 'observation-active.component.html',
  styleUrls: ['./observation-active.component.css']
})
export class ObservationActiveComponent implements OnInit, OnDestroy {

  @Input() skip:string[] = [];
  @Input() fieldMap:{[field:string]:string} = {};
  public active:ActiveList[] = [];

  private subQueryUpdate: Subscription;

  constructor(public searchQuery: SearchQuery) {}

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => this.updateSelectedList()
    );
    this.updateSelectedList();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
  }

  mapField(field) {
    if (this.fieldMap[field]) {
      return this.fieldMap[field];
    }
    return field;
  }

  remove(item:ActiveList) {
    let query = this.searchQuery.query;
    if (query[item.field]) {
      query[item.field] = undefined;
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  updateSelectedList() {
    let query = this.searchQuery.query;
    this.active = [];
    for(let i in query) {
      if (!query.hasOwnProperty(i) || this.skip.indexOf(i) > -1) {
        continue;
      }
      if (typeof query[i] !== "undefined") {
        this.active.push({field: i, value: query[i]})
      }
    }
  }

}

interface ActiveList {
  field:string;
  value:any;
}
