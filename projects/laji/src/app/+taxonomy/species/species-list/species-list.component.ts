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
import { PagedResult } from '../../../shared/model/PagedResult';
import { Logger } from '../../../shared/logger/logger.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TaxonomySearch } from '../service/taxonomy-search.service';
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
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

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

  @Input() search!: TaxonomySearch;
  @Input() visible!: boolean;
  @Input() showDownloadAndBrowse = true;
  @Input() countStartText = '';
  @Input() countEndText = '';

  loading = false;
  downloadLoading = false;

  columns: DatatableColumn[] = [];
  speciesPage: PagedResult<Taxon> = {
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
    private logger: Logger,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef,
    private taxonExportService: TaxonExportService,
    private columnService: TaxonomyColumns,
    private toQname: ToQNamePipe,
    private api: LajiApiClientBService
  ) { }

  ngOnInit() {
    this.loading = true;

    this.subQueryUpdate = this.search.searchUpdated$.subscribe(
      () => {
        this.search.listOptions.page = 1;
        this.refreshSpeciesList();
      }
    );

    this.userService.getUserSetting<any>('taxonomyList').subscribe(data => {
        if (data && data.selected) {
          this.search.listOptions.selected = data.selected;
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
    this.search.listOptions.page = event.offset + 1;
    this.refreshSpeciesList();
  }

  sortOrderChanged(event: any) {
    this.search.listOptions.sortOrder = event;
    this.refreshSpeciesList();
  }

  onReorder(event: any) {
    if (
      !event.column ||
      !event.column.name ||
      this.search.listOptions.selected.indexOf(event.column.name) === -1 ||
      typeof event.newValue !== 'number' ||
      typeof event.prevValue !== 'number'
    ) {
      return;
    }
    this.search.listOptions.selected.splice(event.newValue, 0, this.search.listOptions.selected.splice(event.prevValue, 1)[0]);
    this.saveSettings();
    this.refreshSpeciesList();
  }

  refreshSpeciesList() {
    const cacheKey = JSON.stringify({
          taxon: this.search.taxonId,
          query: this.search.query,
          filters: this.search.filters,
          listOptions: this.search.listOptions
        });
    if (this.lastQuery === cacheKey || !this.settingsLoaded) {
      return;
    }
    this.lastQuery = cacheKey;
    console.log('lol!');

    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.loading = true;

    this.subFetch = this.fetchPage(this.search.listOptions.page)
      .subscribe(data => {
          this.columns = this.columnService.getColumns(this.search.listOptions.selected);

          if (data.lastPage && data.lastPage === 1) {
            this.columns.map(column => { column.sortable = true; });
          } else {
            this.columns.map(column => { column.sortable = false; });
          }

          this.speciesPage = data;
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

    this.columnService.getColumns$(this.search.listOptions.selected).pipe(
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
    this.search.listOptions.page = 1;
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

  private fetchPage(page: number) {
    const { query, filters, taxonId } = this.search;
    return this.api.post('/taxa/{id}/species', {
      path: { id: taxonId || 'MX.37600' },
      query: {
        ...query,
        page,
        pageSize: 1000,
        sortOrder: this.search.listOptions.sortOrder,
        selectedFields: this.getSelectedFields()
      },
    }, filters).pipe(
        map(data => {
          data.results = data.results.map(taxon => {
            if (taxon.parent && Array.isArray(taxon.nonHiddenParentsIncludeSelf)) {
              return {...taxon, parent: (Object.keys(taxon.parent) as (keyof NonNullable<Taxon['parent']>)[]).reduce((parent, level) => {
                if (taxon.nonHiddenParentsIncludeSelf!.includes(taxon.parent![level]!.id!)) {
                  parent![level] = taxon.parent![level];
                }
                return parent;
              }, {} as Taxon['parent'])};
            }
            return taxon;
          });
          return data;
        })
      );
  }

  private getSelectedFields() {
    const selects = this.search.listOptions.selected.reduce((arr: any[], field) => {
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
      selected: this.search.listOptions.selected
    });
  }

  browseObservations() {
    const filters = this.search.filters;

    const [typeOfOccurrenceInFinlandInclusions, typeOfOccurrenceInFinlandExclusions] =
      (filters.typeOfOccurrenceInFinland || []).reduce(([inclusions, exclusions], value) => {
        (value.startsWith('!') ? exclusions : inclusions).push(value);
        return [inclusions, exclusions];
      }, [[],[]] as [string[], string[]]);

    const queryParams: WarehouseQueryInterface = Util.removeFromObject({
      target: this.search.taxonId as any,
      informalTaxonGroupId: filters.informalTaxonGroups,
      onlyFinnish: filters.finnish,
      redListStatusId: filters['latestRedListStatusFinland.status'],
      administrativeStatusId: filters.administrativeStatuses,
      typeOfOccurrenceId: typeOfOccurrenceInFinlandInclusions,
      typeOfOccurrenceIdNot: typeOfOccurrenceInFinlandExclusions,
      invasive: filters.invasiveSpecies,
      primaryHabitat: filters['primaryHabitat.habitat'],
      anyHabitat: filters.primaryHabitatSearchStrings,
      taxonRankId: filters.taxonRank
    });

    this.router.navigate(
      this.localizeRouterService.translateRoute(['/observation/map']), { queryParams }
    );
  }
}
