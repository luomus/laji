import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { DatatableSort } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { IGlobalSpeciesQuery, IGlobalSpeciesFilters, IGlobalSpeciesListResult } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListComponent implements OnChanges {
  @Input() filters?: IGlobalSpeciesFilters = { continent: [], order: [], family: [] };
  @Input() query: IGlobalSpeciesQuery = {};
  @Input() speciesList: IGlobalSpeciesListResult = { results: [], currentPage: 0, total: 0, pageSize: 0, lastPage: 0 };
  @Input() loading = false;

  @Output() speciesSelect = new EventEmitter<number>();
  @Output() queryChange = new EventEmitter<IGlobalSpeciesQuery>();

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

  onQueryChange(query: IGlobalSpeciesQuery) {
    this.changeQuery(query, 1);
  }

  private changeQuery(query: IGlobalSpeciesQuery, page?: number, orderBy?: string[]) {
    this.query = { ...query, page: page || this.query.page, orderBy: orderBy || this.query.orderBy };
    this.queryChange.emit(this.query);
  }
}
