import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, Output, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'bsg-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() searchQuery = '';

  private searchQueryChanged: Subject<string> = new Subject<string>();
  private searchQueryChangeSub: Subscription;

  private debounceTime = 1000;

  @Output() searchQueryChange = new EventEmitter<string>();

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.searchQueryChangeSub = this.searchQueryChanged.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.searchQueryChange.emit(query);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.searchQueryChangeSub) {
      this.searchQueryChangeSub.unsubscribe();
    }
  }

  queryChange(query: string) {
    this.searchQueryChanged.next(query);
  }
}
