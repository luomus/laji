import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WindowRef } from '../../../shared/windows-ref';

@Component({
  selector: 'laji-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {
  public showFilter = true;
  @Input() searchQuery: string;

  @Input() wrapperStyle = {top: '50px', height: 'calc(100vh - 50px)'};
  @Input() hasInvasiveControlRights = false;
  @Output() onShowFilterChange = new EventEmitter<boolean>();
  @Output() onInvasiveControlClick = new EventEmitter();

  constructor(
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

  toInvasiveControlFrom() {
    this.onInvasiveControlClick.emit();
  }
}
