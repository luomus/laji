import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-observation-active',
  templateUrl: 'observation-active.component.html',
  styleUrls: ['./observation-active.component.css']
})
export class ObservationActiveComponent implements OnInit, OnDestroy {

  @Input() skip: string[] = [];
  public active: ActiveList[] = [];
  public showList: boolean = false;

  private subQueryUpdate: Subscription;

  constructor(public searchQuery: SearchQuery) {
  }

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

  toggleActiveList() {
    if (!this.showList && this.active.length === 0) {
      return;
    }
    this.showList = !this.showList;
  }

  remove(item: ActiveList) {
    let query = this.searchQuery.query;
    if (query[item.field]) {
      query[item.field] = undefined;
    }
    if (this.active.length < 2) {
      this.showList = false;
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  removeAll() {
    let query = this.searchQuery.query;
    this.active.map((item) => {
      if (query[item.field]) {
        query[item.field] = undefined;
      }
    });
    this.active = [];
    this.showList = false;
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  updateSelectedList() {
    let query = this.searchQuery.query;
    this.active = [];
    Object.keys(query).map((i) => {
      if (this.skip.indexOf(i) > -1) {
        return;
      }
      let type = typeof query[i];
      if (type !== 'undefined') {
        if (type === 'boolean' || type === 'number' || query[i].length > 0) {
          this.active.push({field: i, value: query[i]});
        }
      }
    });
  }

}

interface ActiveList {
  field: string;
  value: any;
}
