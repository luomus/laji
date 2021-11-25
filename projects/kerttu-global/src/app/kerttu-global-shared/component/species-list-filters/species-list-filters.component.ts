import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IGlobalSpeciesFilters, IGlobalSpeciesQuery } from '../../models';

@Component({
  selector: 'bsg-species-list-filters',
  templateUrl: './species-list-filters.component.html',
  styleUrls: ['./species-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListFiltersComponent {
  @Input() filters: IGlobalSpeciesFilters = { continent: [], order: [], family: [] };
  @Input() query: IGlobalSpeciesQuery = {};
  @Input() showOnlyUnvalidated = true;
  @Input() showSearch = true;

  @Output() queryChange = new EventEmitter<IGlobalSpeciesQuery>();

  selectChange(field: 'continent'|'order'|'family', value: string) {
    this.query[field] = parseInt(value, 10) || null;

    if (field === 'order' && this.query.order != null && this.query.family != null) {
      const family = this.filters.family.filter(f => f.id === this.query.family)[0];
      if (family.order !== this.query.order) {
        this.query.family = null;
      }
    }

    this.onQueryChange();
  }

  onQueryChange() {
    this.queryChange.emit(this.query);
  }
}
