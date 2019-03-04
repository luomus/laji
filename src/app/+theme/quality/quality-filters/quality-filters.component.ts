
import {debounceTime} from 'rxjs/operators';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';


@Component({
  selector: 'laji-quality-filters',
  templateUrl: './quality-filters.component.html',
  styleUrls: ['./quality-filters.component.css']
})
export class QualityFiltersComponent implements OnInit, OnDestroy {
  @Output() select = new EventEmitter();

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
    this.subSearch = this.delayedSearch.pipe(
      debounceTime(this.debouchAfterChange))
      .subscribe(() => {
          this.select.emit(this.filters);
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
