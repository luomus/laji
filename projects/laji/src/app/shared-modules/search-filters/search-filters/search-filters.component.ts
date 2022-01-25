import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BrowserService } from '../../../shared/service/browser.service';

@Component({
  selector: 'laji-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent {
  @Input() showFilter = true;
  @Input() queryType: string;
  @Input() query: object;
  @Input() activeSkip: string[] = [];

  @Output() showFilterChange = new EventEmitter<boolean>();
  @Output() queryChange = new EventEmitter<object>();

  constructor(
    private browserService: BrowserService
  ) { }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.showFilterChange.emit(this.showFilter);
    this.browserService.triggerResizeEvent();
  }
}
