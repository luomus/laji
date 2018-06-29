import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit, Input, Output, EventEmitter , Inject} from '@angular/core';
import { SearchQuery } from '../../../+observation/search-query.model';
import { TaxonomySearchQuery } from '../../../+taxonomy/taxon-browse/taxonomy-search-query.model';
import { WindowRef } from '../../../shared/windows-ref';

@Component({
  selector: 'laji-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {
  @Input() showFilter = true;
  @Input() searchQuery: SearchQuery|TaxonomySearchQuery;

  @Input() hasInvasiveControlRights = false;
  @Output() onShowFilterChange = new EventEmitter<boolean>();
  @Output() onInvasiveControlClick = new EventEmitter();

  constructor(@Inject(WINDOW) private window: Window,
    private winRef: WindowRef
  ) { }

  ngOnInit() {
  }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.onShowFilterChange.emit(this.showFilter);
    try {
      setTimeout(() => {
        try {
          this.winRef.nativeWindow.dispatchEvent(new Event('resize'));
        } catch (e) {
          const evt = this.winRef.nativeWindow.document.createEvent('UIEvents');
          evt.initUIEvent('resize', true, false, window, 0);
          this.winRef.nativeWindow.dispatchEvent(evt);
        }
      }, 50);
    } catch (e) {}
  }

  toInvasiveControlForm() {
    this.onInvasiveControlClick.emit();
  }
}
