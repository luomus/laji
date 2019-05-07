
import {filter} from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import { SearchQueryInterface } from '../search-query.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-observation-active',
  templateUrl: './observation-active.component.html',
  styleUrls: ['./observation-active.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationActiveComponent implements OnInit, OnDestroy {
  @Input() searchQuery: SearchQueryInterface;

  public active: ActiveList[] = [];
  public showList = false;

  private subQueryUpdate: Subscription;
  private el: Element;

  constructor(
    viewContainerRef: ViewContainerRef,
    private cdr: ChangeDetectorRef
  ) {
    this.el = viewContainerRef.element.nativeElement;
  }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.pipe(
      filter(data => !(data && data.formSubmit)))
      .subscribe(() => {
        this.updateSelectedList();
        this.cdr.markForCheck();
      });
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
    const query = {...this.searchQuery.query};
    if (typeof query[item.field] !== 'undefined') {
      query[item.field] = undefined;
    }
    if (this.active && this.active.length < 2) {
      this.showList = false;
    }
    this.searchQuery.query = query;
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  removeAll() {
    const skip = this.searchQuery.skippedQueryParams ? this.searchQuery.skippedQueryParams : [];
    const query = {...this.searchQuery.query};
    Object.keys(query).map((key) => {
      if (skip.indexOf(key) === -1 && typeof query[key] !== 'undefined') {
        query[key] = undefined;
      }
    });
    this.active = [];
    this.showList = false;
    this.searchQuery.query = query;
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  updateSelectedList() {
    const skip = this.searchQuery.skippedQueryParams ? this.searchQuery.skippedQueryParams : [];
    const query = this.searchQuery.query;
    const active = [];
    const doubles = {};
    const keys = Object.keys(query);

    if (keys && keys.length > 0) {
      keys.map((i) => {
        if (skip.indexOf(i) > -1 || i.substr(0, 1) === '_') {
          return;
        }
        const type = typeof query[i];
        if (type !== 'undefined') {
          if (type === 'boolean' || type === 'number' || (query[i] && query[i].length > 0)) {

            // show only on teamMember text
            if (['teamMember', 'teamMemberId'].indexOf(i) !== -1) {
              if (doubles['teamMember']) {
                return;
              }
              doubles['teamMember'] = true;
            }

            // show only on firstloaded text
            if (['firstLoadedSameOrBefore', 'firstLoadedSameOrAfter'].indexOf(i) !== -1) {
              if (doubles['firstLoaded']) {
                return;
              }
              doubles['firstLoaded'] = true;
            }

            active.push({field: i, value: query[i]});
          }
        }
      });
    }

    this.active = active;
  }

}

interface ActiveList {
  field: string;
  value: any;
}
