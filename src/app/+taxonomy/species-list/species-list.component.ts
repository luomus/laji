import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { PagedResult } from '../../shared/model/PagedResult';
import { InformalTaxonGroupApi } from '../../shared/api/InformalTaxonGroupApi';
import { InformalTaxonGroup } from '../../shared';
import { Logger } from '../../shared/logger/logger.service';
import { ObservationTableColumn } from '../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { SearchQuery } from '../../+observation/search-query.model';


@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.css'],
  providers: []
})
export class SpeciesListComponent implements OnInit, OnDestroy {
  public informalGroup: InformalTaxonGroup;

  loading = false;
  speciesPage: PagedResult<Taxonomy> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };

  columns: ObservationTableColumn[] = [
    {
      name: 'vernacularName',
      label: 'taxonomy.vernacular.name',
      sortable: false
    },
    {
      name: 'scientificName',
      label: 'taxonomy.scientific.name',
      cellTemplate: 'taxonScientificName',
      sortable: false
    }
  ];

  private warehouseToTaxaQueryMap = {
    'finnish': 'onlyFinnish',
    'redListStatusId': 'redListStatusFilters',
    'administrativeStatusId': 'adminStatusFilters',
    'invasive': 'onlyInvasive'
  };

  private subQueryUpdate: Subscription;
  private subFetch: Subscription;

  constructor(
    private taxonomyService: TaxonomyApi,
    private informalTaxonService: InformalTaxonGroupApi,
    private translate: TranslateService,
    private logger: Logger,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private searchQuery: SearchQuery
  ) { }

  ngOnInit() {
    this.loading = true;
    this.refreshSpeciesList();

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => this.refreshSpeciesList()
    );
  }

  ngOnDestroy() {
    this.subQueryUpdate.unsubscribe();
  }

  onRowSelect(event) {
    if (event.row && event.row.id) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', event.row.id]));
    }
  }

  pageChanged(event) {
    this.refreshSpeciesList(event.offset + 1);
  }

  refreshSpeciesList(page = 1) {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.loading = true;

    const query = this.searchQueryToTaxaQuery();

    if (!this.informalGroup || this.informalGroup.id !== query.informalTaxonGroupId) {
      this.onInformalTaxonGroupChange(query.informalTaxonGroupId);
    }

    this.subFetch = this.taxonomyService
      .taxonomyFindSpecies(
        query.target,
        this.translate.currentLang,
        query.informalTaxonGroupId,
        undefined,
        undefined,
        undefined,
        undefined,
        `${page}`,
        '1000',
        undefined,
        query.extraParameters
        // 'finnish_name'
      )
      .subscribe(data => {
          if (data.lastPage && data.lastPage === 1) {
            this.columns = this.columns.map(column => ({...column, sortable: true}));
          } else {
            this.columns = this.columns.map(column => ({...column, sortable: false}));
          }
          this.speciesPage = data;
          this.loading = false;
        },
        err => {
          this.logger.warn('Failed to fetch species list', err);
          this.loading = false;
        }
      );
  }

  private searchQueryToTaxaQuery() {
    const informalTaxonGroupId = this.searchQuery.query.informalTaxonGroupId ? this.searchQuery.query.informalTaxonGroupId[0] : undefined;
    const target = this.searchQuery.query.target && this.searchQuery.query.target[0] ? this.searchQuery.query.target[0] : 'MX.37600';
    const extraParameters = {...this.searchQuery.query};
    extraParameters['target'] = undefined;
    extraParameters['informalTaxonGroupId'] = undefined;
    extraParameters['selectedFields'] = 'vernacularName,scientificName,cursiveName,id';
    for (const key in this.warehouseToTaxaQueryMap) {
      if (extraParameters[key]) {
        extraParameters[this.warehouseToTaxaQueryMap[key]] = extraParameters[key];
        extraParameters[key] = undefined
      }
    }

    return {
      informalTaxonGroupId,
      target,
      extraParameters
    }
  }

  private onInformalTaxonGroupChange(id) {
    if (!id) {
      this.translate.get('species.list.all')
        .subscribe((name) => {
          this.informalGroup = {name: name};
        })
    } else {
      this.informalTaxonService.informalTaxonGroupFindById(id, this.translate.currentLang)
        .subscribe(data => this.informalGroup = data);
    }
  }
}
