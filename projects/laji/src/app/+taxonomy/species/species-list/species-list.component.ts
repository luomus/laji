import { map, switchMap } from 'rxjs/operators';
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
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
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
import { DatatableComponent } from '../../../shared-modules/datatable/datatable/datatable.component';
import { Util } from '../../../shared/service/util.service';
import { UserService } from '../../../shared/service/user.service';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { DatatableHeaderComponent } from '../../../shared-modules/datatable/datatable-header/datatable-header.component';
import { ToFullUriPipe } from 'projects/laji/src/app/shared/pipe/to-full-uri';
import { ToQNamePipe } from 'projects/laji/src/app/shared/pipe/to-qname.pipe';

@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.css'],
  providers: [ToFullUriPipe, ToQNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(DatatableHeaderComponent) speciesDownload!: DatatableHeaderComponent;
  @ViewChild('settingsModal', { static: true }) settingsModal!: SpeciesListOptionsModalComponent;
  @ViewChild('dataTable', { static: true }) public datatable!: DatatableComponent;

  @Input() searchQuery!: TaxonomySearchQuery;
  @Input() visible!: boolean;
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

  private lastQuery: string | undefined;
  private subQueryUpdate: Subscription | undefined;
  private subFetch: Subscription | undefined;

  private settingsLoaded = false;

  constructor(
    private userService: UserService,
    private taxonomyService: TaxonomyApi,
    private logger: Logger,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef,
    private taxonExportService: TaxonExportService,
    private columnService: TaxonomyColumns,
    private fullUri: ToFullUriPipe,
    private toQname: ToQNamePipe
  ) { }

  ngOnInit() {
    this.loading = true;

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.searchQuery.listOptions.page = 1;
        this.refreshSpeciesList();
      }
    );

    this.userService.getUserSetting<any>('taxonomyList').subscribe(data => {
        if (data && data.selected) {
          this.searchQuery.listOptions.selected = data.selected;
        }
        this.settingsLoaded = true;
        this.refreshSpeciesList();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visible && this.visible && this.datatable) {
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

  onRowSelect(event: any) {
    if (event.row && event.row.id) {
      this.router.navigate(
        this.localizeRouterService.translateRoute(['/taxon', this.toQname.transform(event.row.id)])
      );
    }
  }

  pageChanged(event: any) {
    this.searchQuery.listOptions.page = event.offset + 1;
    this.refreshSpeciesList();
  }

  sortOrderChanged(event: any) {
    this.searchQuery.listOptions.sortOrder = event;
    this.refreshSpeciesList();
  }

  onReorder(event: any) {
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
            this.columns.map(column => {column.sortable = true; });
          } else {
            this.columns.map(column => {column.sortable = false; });
          }

          this.speciesPage = data;
          this.speciesPage.results.map(r => {
            if (r['id']) {
              r['id'] = this.fullUri.transform(r['id']);
            }
          });
          this.loading = false;
          this.datatable?.refreshTable();
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

    this.columnService.getColumns$(this.searchQuery.listOptions.selected).pipe(
      switchMap(columns => this.fetchAllPages().pipe(map((data) => ({data, columns})))),
      switchMap(res => this.taxonExportService.downloadTaxons(res.columns, res.data, fileType))
    ).subscribe(() =>  {
          this.downloadLoading = false;
          this.speciesDownload?.downloadComponent?.closeModal();
          this.cd.markForCheck();
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

  private fetchAllPages(page = 1, data: any[] = []): Observable<any> {
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
      ).pipe(
        map(data => {
          if (data && Array.isArray(data.results)) {
            data.results = data.results.map(taxon => {
              if (taxon.parent && Array.isArray(taxon.nonHiddenParentsIncludeSelf)) {
                return {...taxon, parent: Object.keys(taxon.parent).reduce((parent: any, level) => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  if (taxon.nonHiddenParentsIncludeSelf!.includes(taxon.parent[level].id)) {
                    parent[level] = taxon.parent[level];
                  }
                  return parent;
                }, {})};
              }
              return taxon;
            });
          }
          return data;
        })
      );
  }

  private searchQueryToTaxaQuery() {
    const query = this.searchQuery.query;
    const target = query.target ? query.target : 'MX.37600';
    const extraParameters: any = {...query};
    extraParameters['target'] = undefined;
    extraParameters['selectedFields'] = this.getSelectedFields();

    return {
      target,
      extraParameters: extraParameters as typeof query & { selectedFields: string }
    };
  }

  private getSelectedFields() {
    const selects = this.searchQuery.listOptions.selected.reduce((arr: any[], field) => {
      let addedField: string|string[] = field;
      if (this.columnService.columnLookup[field] && this.columnService.columnLookup[field].selectField) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        addedField = this.columnService.columnLookup[field].selectField!;
      }
      ((Array.isArray(addedField) ? addedField : [addedField]) as string[]).forEach(f => {
        if (arr.indexOf(f) === -1) {
          arr.push(f);
        }
      });
      return arr;
    }, []);

    ['id', 'nonHiddenParentsIncludeSelf'].forEach(field => {
      if (selects.indexOf(field) === -1) {
        selects.push(field);
      }
    });

    return selects.join(',');
  }

  private saveSettings() {
    this.userService.setUserSetting('taxonomyList', {
      selected: this.searchQuery.listOptions.selected
    });
  }

  browseObservations() {
    const query = this.searchQuery.query;

    const parameters: WarehouseQueryInterface = Util.removeFromObject({
      informalTaxonGroupId: query.informalGroupFilters as any,
      target: query.target as any,
      finnish: query.onlyFinnish,
      redListStatusId: query.redListStatusFilters,
      administrativeStatusId: query.adminStatusFilters,
      typeOfOccurrenceId: query.typesOfOccurrenceFilters,
      typeOfOccurrenceIdNot: query.typesOfOccurrenceNotFilters,
      invasive: query.invasiveSpeciesFilter,
      primaryHabitat: query.primaryHabitat,
      anyHabitat: query.anyHabitat,
      taxonRankId: query.taxonRanks
    });

    this.router.navigate(
      this.localizeRouterService.translateRoute(
        ['/observation/map']
      ), {queryParams: parameters}
    );
  }
}
