import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { Subscription ,  Observable, of as ObservableOf } from 'rxjs';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { PagedResult } from '../../../shared/model/PagedResult';
import { Logger } from '../../../shared/logger/logger.service';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { SpeciesDownloadComponent } from '../species-download/species-download.component';
import { SpeciesListOptionsModalComponent } from '../species-list-options-modal/species-list-options-modal.component';
import { TaxonomyColumns } from '../service/taxonomy-columns';
import { TaxonExportService } from '../service/taxon-export.service';
import { DatatableUtil } from '../service/datatable-util.service';

@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.css']
})
export class SpeciesListComponent implements OnInit, OnDestroy {
  @ViewChild('speciesDownload') speciesDownload: SpeciesDownloadComponent;
  @ViewChild('settingsModal') settingsModal: SpeciesListOptionsModalComponent;
  @Input() searchQuery: TaxonomySearchQuery;
  @Input() columnService: TaxonomyColumns;

  loading = false;
  downloadLoading = false;

  columns: ObservationTableColumn[] = [];
  speciesPage: PagedResult<Taxonomy> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };

  private lastQuery: string;
  private subQueryUpdate: Subscription;
  private subFetch: Subscription;

  private settingsLoaded = false;

  constructor(
    private taxonomyService: TaxonomyApi,
    private logger: Logger,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef,
    private taxonExportService: TaxonExportService
  ) { }

  ngOnInit() {
    this.loading = true;

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.searchQuery.listOptions.page = 1;
        this.refreshSpeciesList();
      }
    );
  }

  ngOnDestroy() {
    this.subQueryUpdate.unsubscribe();
  }

  onSettingsLoaded() {
    this.settingsLoaded = true;
    this.refreshSpeciesList();
  }

  onRowSelect(event) {
    if (event.row && event.row.id) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', event.row.id]));
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

          if (data.lastPage && data.lastPage === 1) {
            this.columns.map(column => {column.sortable = true});
          } else {
            this.columns.map(column => {column.sortable = false});
          }

          this.speciesPage = data;
          this.loading = false;
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

  onCloseModal() {
    this.searchQuery.listOptions.page = 1;
    this.refreshSpeciesList();
  }

  private fetchAllPages(page = 1, data = []): Observable<any> {
    return this.fetchPage(page)
      .switchMap(result => {
        data.push(...result.results);
        if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
          return this.fetchAllPages(result.currentPage + 1, data);
        } else {
          return ObservableOf(data);
        }
      });
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
      )
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
    }
  }

  private getSelectedFields() {
    const selects = this.searchQuery.listOptions.selected.reduce((arr, field) => {
      let addedField = field;
      if (this.columnService.columnLookup[field] && this.columnService.columnLookup[field].selectField) {
        addedField = this.columnService.columnLookup[field].selectField;
      }
      if (arr.indexOf(addedField) === -1) {
        arr.push(addedField);
      }
      return arr;
    }, []);

    if (selects.indexOf('id') === -1) {
      selects.push('id');
    }
    return selects.join(',');
  }
}
