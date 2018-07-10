import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit, Input, Output, EventEmitter , Inject} from '@angular/core';
import { SearchQueryInterface } from '../search-query.interface';

@Component({
  selector: 'laji-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {
  @Input() showFilter = true;
  @Input() searchQuery: SearchQueryInterface;

  @Input() hasInvasiveControlRights = false;
  @Output() onShowFilterChange = new EventEmitter<boolean>();
  @Output() onInvasiveControlClick = new EventEmitter();

  constructor(@Inject(WINDOW) private window: Window
  ) { }

  ngOnInit() {
  }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.onShowFilterChange.emit(this.showFilter);
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

  toInvasiveControlForm() {
    this.onInvasiveControlClick.emit();
  }
}
