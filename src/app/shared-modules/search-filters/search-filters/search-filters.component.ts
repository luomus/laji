import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchQueryInterface } from '../search-query.interface';
import { BrowserService } from '../../../shared/service/browser.service';

@Component({
  selector: 'laji-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent {
  @Input() showFilter = true;
  @Input() searchQuery: SearchQueryInterface;

  @Output() showFilterChange = new EventEmitter<boolean>();

  constructor(
    private browserService: BrowserService
  ) { }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.showFilterChange.emit(this.showFilter);
    this.browserService.triggerResizeEvent();
  }
}
