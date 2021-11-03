import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IGlobalSpeciesFilters, IGlobalSpeciesQuery } from '../../models';

@Component({
  selector: 'laji-species-list-filters',
  templateUrl: './species-list-filters.component.html',
  styleUrls: ['./species-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListFiltersComponent {
  @Input() filters: IGlobalSpeciesFilters = { continent: [], order: [], family: [] };
  @Input() query: IGlobalSpeciesQuery = {};
  @Input() showOnlyUnvalidated = true;

  @Output() queryChange = new EventEmitter<IGlobalSpeciesQuery>();

  selectChange(field: 'continent'|'order'|'family', value: string) {
    this.query[field] = parseInt(value, 10) || null;
    this.onQueryChange();
  }

  onQueryChange() {
    this.queryChange.emit(this.query);
  }
}
