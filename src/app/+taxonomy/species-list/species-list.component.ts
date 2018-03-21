import { Component, OnInit } from '@angular/core';
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
export class SpeciesListComponent implements OnInit {
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
    this.onInformalTaxonGroupChange();
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
    this.subFetch = this.taxonomyService
      .taxonomyFindSpecies(
        this.searchQuery.query.target[0],
        this.translate.currentLang,
        this.searchQuery.query.informalTaxonGroupId[0],
        undefined,
        undefined,
        undefined,
        undefined,
        `${page}`,
        '1000',
        undefined,
        {selectedFields: 'vernacularName,scientificName,cursiveName,id'}
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

  onInformalTaxonGroupChange() {
    console.log(this.searchQuery.query);
    const id = this.searchQuery.query.informalTaxonGroupId[0];
    console.log(id);

    this.informalTaxonService.informalTaxonGroupGetChildren(id, this.translate.currentLang)
      .combineLatest(this.informalTaxonService.informalTaxonGroupFindById(id, this.translate.currentLang))
      .map(data => this.parseInformalTaxonGroup(data))
      .subscribe(data => this.informalGroup = data);
  }

  private parseInformalTaxonGroup(data) {
    const { results } = data[0];
    const { id, name } = data[1];
    return { results, id, name };
  };
}
