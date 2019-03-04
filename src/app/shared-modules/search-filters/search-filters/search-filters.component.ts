import { WINDOW } from '@ng-toolkit/universal';
import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { SearchQueryInterface } from '../search-query.interface';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {
  @Input() showFilter = true;
  @Input() searchQuery: SearchQueryInterface;

  @Output() showFilterChange = new EventEmitter<boolean>();

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object
  ) { }

  ngOnInit() {
  }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.showFilterChange.emit(this.showFilter);
    if (!isPlatformBrowser(this.platformID)) {
      return;
    }
    try {
      setTimeout(() => {
        try {
          this.window.dispatchEvent(new Event('resize'));
        } catch (e) {
          const evt = this.window.document.createEvent('UIEvents');
          evt.initUIEvent('resize', true, false, window, 0);
          this.window.dispatchEvent(evt);
        }
      }, 50);
    } catch (e) {}
  }
}
