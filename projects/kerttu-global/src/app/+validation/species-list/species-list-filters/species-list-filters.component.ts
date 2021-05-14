import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IKerttuSpeciesFilters, IKerttuSpeciesQuery } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-list-filters',
  templateUrl: './species-list-filters.component.html',
  styleUrls: ['./species-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListFiltersComponent {
  @Input() filters: IKerttuSpeciesFilters = {continent: [], order: [], family: []};
  @Input() query: IKerttuSpeciesQuery = {};

  @Output() queryChange = new EventEmitter<IKerttuSpeciesQuery>();

  selectChange(field: 'continent'|'order'|'family', value: string) {
    this.query[field] = parseInt(value, 10) || null;
    this.onQueryChange();
  }

  onQueryChange() {
    this.queryChange.emit(this.query);
  }
}
