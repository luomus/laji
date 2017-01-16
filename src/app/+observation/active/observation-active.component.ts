import { Component, OnInit, OnDestroy, Input, HostListener, ViewContainerRef } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-observation-active',
  templateUrl: './observation-active.component.html',
  styleUrls: ['./observation-active.component.css']
})
export class ObservationActiveComponent implements OnInit, OnDestroy {

  @Input() skip: string[] = [];
  public active: ActiveList[] = [];
  public showList: boolean = false;

  private subQueryUpdate: Subscription;
  private el: Element;

  constructor(viewContainerRef: ViewContainerRef, public searchQuery: SearchQuery) {
    this.el = viewContainerRef.element.nativeElement;
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

  @HostListener('body:click', ['$event.target'])
  onHostClick(target) {
    if (!this.showList || !target) {
      return;
    }
    if (this.el !== target && !this.el.contains((<any>target))) {
      this.toggleActiveList();
    }
  }

  toggleActiveList() {
    if (!this.showList && this.active && this.active.length === 0) {
      return;
    }
    this.showList = !this.showList;
  }

  remove(item: ActiveList) {
    let query = this.searchQuery.query;
    if (typeof query[item.field] !== 'undefined') {
      query[item.field] = undefined;
    }
    if (this.active && this.active.length < 2) {
      this.showList = false;
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  removeAll() {
    let query = this.searchQuery.query;
    Object.keys(query).map((key) => {
      if (this.skip.indexOf(key) === -1 && typeof query[key] !== 'undefined') {
        query[key] = undefined;
      }
    });
    this.active = [];
    this.showList = false;
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  updateSelectedList() {
    let query = this.searchQuery.query;
    this.active = [];
    let keys = Object.keys(query);
    if (!keys || keys.length === 0) {
      return;
    }
    keys.map((i) => {
      if (this.skip.indexOf(i) > -1) {
        return;
      }
      let type = typeof query[i];
      if (type !== 'undefined') {
        if (type === 'boolean' || type === 'number' || (query[i] && query[i].length > 0)) {
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
