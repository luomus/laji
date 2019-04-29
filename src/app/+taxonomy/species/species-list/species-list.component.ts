import {switchMap,  map, tap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf, Subscription } from 'rxjs';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { PagedResult } from '../../../shared/model/PagedResult';
import { Logger } from '../../../shared/logger/logger.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { SpeciesListOptionsModalComponent } from '../species-list-options-modal/species-list-options-modal.component';
import { TaxonomyColumns } from '../service/taxonomy-columns';
import { TaxonExportService } from '../service/taxon-export.service';
import { DatatableUtil } from '../../../shared-modules/datatable/service/datatable-util.service';
import { DatatableComponent } from '../../../shared-modules/datatable/datatable/datatable.component';
import { Util } from '../../../shared/service/util.service';
import { UserService } from '../../../shared/service/user.service';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { DownloadComponent } from '../../../shared-modules/download/download.component';

@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('speciesDownload') speciesDownload: DownloadComponent;
  @ViewChild('settingsModal') settingsModal: SpeciesListOptionsModalComponent;
  @ViewChild('dataTable') public datatable: DatatableComponent;

  @Input() searchQuery: TaxonomySearchQuery;
  @Input() visible: boolean;
  @Input() showDownloadAndBrowse = true;
  @Input() countStartText = '';
  @Input() countEndText = '';

  loading = false;
  downloadLoading = false;

  columns: DatatableColumn[] = [];
  speciesPage: PagedResult<Taxonomy> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };

  private defaultSortOrder: string[];
  private sortValues = {};
  private prevSorts: any;

  private lastQuery: string;
  private subQueryUpdate: Subscription;
  private subFetch: Subscription;

  private settingsLoaded = false;

  constructor(
    private userService: UserService,
    private taxonomyService: TaxonomyApi,
    private logger: Logger,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef,
    private taxonExportService: TaxonExportService,
    private dtUtil: DatatableUtil,
    public columnService: TaxonomyColumns
  ) { }

  ngOnInit() {
    this.loading = true;

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.searchQuery.listOptions.page = 1;
        this.refreshSpeciesList();
      }
    );

    this.userService.getItem<any>(UserService.SETTINGS_TAXONOMY_LIST)
      .subscribe(data => {
        if (data && data.selected) {
          this.searchQuery.listOptions.selected = data.selected;
        }
        this.settingsLoaded = true;
        this.refreshSpeciesList();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visible && this.visible) {
      this.datatable.refreshTable();
    }
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
  }

  onRowSelect(event) {
    if (event.row && event.row.id) {
      this.router.navigate(
        this.localizeRouterService.translateRoute(['/taxon', event.row.id])
      );
    }
  }

  pageChanged(event) {
    this.searchQuery.listOptions.page = event.offset + 1;
    this.refreshSpeciesList();
  }

  sortOrderChanged(event) {
    this.searchQuery.listOptions.sortOrder = event;
    this.refreshSpeciesList();
  }

  onSort(event) {
    this.sort(event.sorts, this.speciesPage)
      .subscribe(result => {
        this.speciesPage = result;
      });
  }

  onReorder(event) {
    if (
      !event.column ||
      !event.column.name ||
      this.searchQuery.listOptions.selected.indexOf(event.column.name) === -1 ||
      typeof event.newValue !== 'number' ||
      typeof event.prevValue !== 'number'
    ) {
      return;
    }
    this.searchQuery.listOptions.selected.splice(event.newValue, 0, this.searchQuery.listOptions.selected.splice(event.prevValue, 1)[0]);
    this.saveSettings();
    this.refreshSpeciesList();
  }

  private sort(sorts, page: PagedResult<Taxonomy>): Observable<PagedResult<Taxonomy>> {
    this.prevSorts = sorts;
    const rows = [...page.results];

    return this.setSortValues(sorts, rows)
      .pipe(map(() => {
        if (sorts.length > 0) {
          this.customSort(sorts, rows);
        } else {
          this.defaultSort(rows);
        }

        return {
          currentPage: page.currentPage,
          lastPage: page.lastPage,
          results: rows,
          total: page.total,
          pageSize: page.pageSize
        };
      }));
  }

  private setSortValues(sorts, results: Taxonomy[]): Observable<any> {
    const obs = sorts.reduce((arr, sort) => {
      const template = this.columnService.columnLookup[sort.prop].cellTemplate;
      results.forEach((row) => {
        if (!this.sortValues[row.id]) {
          this.sortValues[row.id] = {};
        }

        if (this.sortValues[row.id][sort.prop] == null) {
          const rowValue = Util.parseJSONPath(row, sort.prop);

          if (!template || rowValue == null) {
            this.sortValues[row.id][sort.prop] = rowValue;
          } else {
            arr.push(
              this.dtUtil.getVisibleValue(rowValue, row, template)
                .pipe(tap(val => {
                  this.sortValues[row.id][sort.prop] = val;
                }))
            );
          }
        }
      });
      return arr;
    }, []);

    return (obs.length > 0 ? ObservableForkJoin(obs) : ObservableOf([]));
  }

  private customSort(sorts, results: Taxonomy[]) {
    sorts.forEach((sort) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      results.sort((a, b) => {
        const aa = this.sortValues[a.id][sort.prop] != null ? this.sortValues[a.id][sort.prop] : '';
        const bb = this.sortValues[b.id][sort.prop] != null ? this.sortValues[b.id][sort.prop] : '';
        return dir * ('' + aa).localeCompare('' + bb);
      });
    });
  }

  private defaultSort(results: Taxonomy[]) {
    const values = [...results];

    values.forEach((val) => {
      const newIdx = this.defaultSortOrder.indexOf(val.id);
      results[newIdx] = val;
    });
  }

  refreshSpeciesList() {
    const cacheKey = JSON.stringify({
      query: this.searchQuery.query,
      listOptions: this.searchQuery.listOptions
    });
    if (this.lastQuery === cacheKey || !this.settingsLoaded) {
      return;
    }
    this.lastQuery = cacheKey;

    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.loading = true;

    this.subFetch = this.fetchPage(this.searchQuery.listOptions.page)
      .subscribe(data => {
          this.columns = this.columnService.getColumns(this.searchQuery.listOptions.selected);
          this.sortValues = {};

          if (data.lastPage && data.lastPage === 1) {
            this.columns.map(column => {column.sortable = true; });
            this.defaultSortOrder = data.results.map(res => res.id);

            if (this.prevSorts) {
              this.sort(this.prevSorts, data)
                .subscribe(page => {
                  this.speciesPage = page;
                  this.loading = false;
                  this.cd.markForCheck();
                });
              return;
            }
          } else {
            this.columns.map(column => {column.sortable = false; });
          }

          this.speciesPage = data;
          this.loading = false;
          this.datatable.refreshTable();
          this.cd.markForCheck();
        },
        err => {
          this.logger.warn('Failed to fetch species list', err);
          this.loading = false;
          this.cd.markForCheck();
        }
      );
  }

  download(fileType: string) {
    this.downloadLoading = true;

    const columns = this.columnService.getColumns(this.searchQuery.listOptions.selected);
    this.fetchAllPages()
      .subscribe(data =>  {
        this.taxonExportService.downloadTaxons(columns, data, fileType)
          .subscribe(() => {
            this.downloadLoading = false;
            this.speciesDownload.modal.hide();
            this.cd.markForCheck();
          });
      });
  }

  openModal() {
    this.settingsModal.openModal();
  }

  onSettingsChange() {
    this.saveSettings();
    this.searchQuery.listOptions.page = 1;
    this.refreshSpeciesList();
  }

  private fetchAllPages(page = 1, data = []): Observable<any> {
    return this.fetchPage(page).pipe(
      switchMap(result => {
        data.push(...result.results);
        if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
          return this.fetchAllPages(result.currentPage + 1, data);
        } else {
          return ObservableOf(data);
        }
      }));
  }

  private fetchPage(page: number): Observable<PagedResult<Taxonomy>> {
    if (!this.loading && this.speciesPage.currentPage === page) {
      return ObservableOf(this.speciesPage);
    }

    const query = this.searchQueryToTaxaQuery();

    return this.taxonomyService
      .taxonomyFindSpecies(
        query.target,
        'multi',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        '' + page,
        '1000',
        this.searchQuery.listOptions.sortOrder,
        query.extraParameters
      );
  }

  private searchQueryToTaxaQuery() {
    const query = this.searchQuery.query;
    const target = query.target ? query.target : 'MX.37600';
    const extraParameters = {...query};
    extraParameters['target'] = undefined;
    extraParameters['selectedFields'] = this.getSelectedFields();

    return {
      target,
      extraParameters
    };
  }

  private getSelectedFields() {
    const selects = this.searchQuery.listOptions.selected.reduce((arr, field) => {
      let addedField = field;
      if (this.columnService.columnLookup[field] && this.columnService.columnLookup[field].selectField) {
        addedField = this.columnService.columnLookup[field].selectField;
      }
      ((Array.isArray(addedField) ? addedField : [addedField]) as string[]).forEach(f => {
        if (arr.indexOf(f) === -1) {
          arr.push(f);
        }
      });
      return arr;
    }, []);

    if (selects.indexOf('id') === -1) {
      selects.push('id');
    }
    return selects.join(',');
  }

  private saveSettings() {
    this.userService.setItem(UserService.SETTINGS_TAXONOMY_LIST, {
      selected: this.searchQuery.listOptions.selected
    }).subscribe(() => {}, () => {});
  }
}
