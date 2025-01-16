import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BrowserService } from '../../../shared/service/browser.service';

@Component({
  selector: 'laji-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent {
  @Input() showFilter = true;
  @Input({ required: true }) queryType!: string;
  @Input({ required: true }) query!: Record<string, unknown>;
  @Input() activeSkip: string[] = [];

  @Output() showFilterChange = new EventEmitter<boolean>();
  @Output() queryChange = new EventEmitter<Record<string, unknown>>();

  constructor(
    private browserService: BrowserService
  ) { }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.showFilterChange.emit(this.showFilter);
    this.browserService.triggerResizeEvent();
  }
}
