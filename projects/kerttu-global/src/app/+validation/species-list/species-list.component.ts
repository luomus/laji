import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { DatatableSort } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { IGlobalSpeciesQuery, IGlobalSpeciesFilters, IGlobalSpeciesListResult } from '../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListComponent {
  @Input() filters: IGlobalSpeciesFilters = { continent: [], order: [], family: [] };
  @Input() query: IGlobalSpeciesQuery = {};
  @Input() speciesList: IGlobalSpeciesListResult = { results: [], currentPage: 0, total: 0, pageSize: 0 };
  @Input() loading = false;

  @Output() speciesSelect = new EventEmitter<number>();
  @Output() queryChange = new EventEmitter<IGlobalSpeciesQuery>();

  onPageChange(page: number) {
    this.query = {...this.query, page: page};
    this.changeQuery();
  }

  onSortChange(sorts: DatatableSort[]) {
    const orderBy = sorts.map(sort => {
      return sort.prop + ' ' + sort.dir.toUpperCase();
    });
    this.query = { ...this.query, page: 1, orderBy: orderBy };
    this.changeQuery();
  }

  onQueryChange(query: IGlobalSpeciesQuery) {
    this.query = { ...query, page: 1, orderBy: this.query.orderBy };
    this.changeQuery();
  }

  private changeQuery() {
    this.queryChange.emit(this.query);
  }
}
