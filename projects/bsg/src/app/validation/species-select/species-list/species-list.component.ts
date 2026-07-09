import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { DatatableSort } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { SpeciesQuery, SpeciesFilters, SpeciesListResult } from '../../../bsg-shared/models';

@Component({
    selector: 'bsg-species-list',
    templateUrl: './species-list.component.html',
    styleUrls: ['./species-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SpeciesListComponent implements OnChanges {
  @Input() filters?: SpeciesFilters = { continent: [], order: [], family: [] };
  @Input() query: SpeciesQuery = {};
  @Input() speciesList: SpeciesListResult = { results: [], currentPage: 0, total: 0, pageSize: 0, lastPage: 0 };
  @Input() loading = false;

  @Output() speciesSelect = new EventEmitter<number>();
  @Output() queryChange = new EventEmitter<SpeciesQuery>();

  sorts: DatatableSort[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.query) {
      this.sorts = (this.query.orderBy || []).map(order => {
        const parts = order.split(' ');
        return {
          prop: parts[0],
          dir: parts[1].toLowerCase() as ('asc'|'desc')
        };
      });
    }
  }

  onPageChange(page: number) {
    this.changeQuery(this.query, page);
  }

  onSortChange(sorts: DatatableSort[]) {
    const orderBy = sorts.map(sort => sort.prop + ' ' + sort.dir.toUpperCase());
    this.changeQuery(this.query, 1, orderBy);
  }

  onQueryChange(query: SpeciesQuery) {
    this.changeQuery(query, 1);
  }

  private changeQuery(query: SpeciesQuery, page?: number, orderBy?: string[]) {
    this.query = { ...query, page: page || this.query.page, orderBy: orderBy || this.query.orderBy };
    this.queryChange.emit(this.query);
  }
}
