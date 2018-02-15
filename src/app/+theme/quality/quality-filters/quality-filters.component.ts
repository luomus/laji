import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-quality-filters',
  templateUrl: './quality-filters.component.html',
  styleUrls: ['./quality-filters.component.css']
})
export class QualityFiltersComponent implements OnInit, OnDestroy {
  @Output() onSelect = new EventEmitter();

  filters = {
    group: '',
    timeStart: '',
    timeEnd: ''
  };

  private delayedSearchSource = new Subject<any>();
  private delayedSearch = this.delayedSearchSource.asObservable();
  private debouchAfterChange = 500;
  private subSearch: Subscription;

  constructor(
    public translateService: TranslateService
  ) {}

  ngOnInit() {
    this.subSearch = this.delayedSearch
      .debounceTime(this.debouchAfterChange)
      .subscribe(() => {
          this.onSelect.emit(this.filters);
      });
  }

  ngOnDestroy() {
    if (this.subSearch) {
      this.subSearch.unsubscribe();
    }
  }


  onSelectChange() {
    this.delayedSearchSource.next();
  }
}
