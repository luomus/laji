import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { PagedResult } from '../../../shared/model/PagedResult';
import { Logger } from '../../../shared/logger/logger.service';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';
import { ModalDirective } from 'ngx-bootstrap';
import { UserService } from '../../../shared/service/user.service';


@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.css'],
  providers: []
})
export class SpeciesListComponent implements OnInit, OnDestroy {
  @ViewChild('settingsModal') public modalRef: ModalDirective;
  @Input() searchQuery: TaxonomySearchQuery;

  loading = false;
  speciesPage: PagedResult<Taxonomy> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };

  _selected: string[];
  columns: ObservationTableColumn[] = [];
  allColumns: ObservationTableColumn[] = [
    {
      name: 'id',
      label: 'taxonomy.card.id',
      width: 95
    },
    {
      name: 'taxonRank',
      label: 'taxonomy.rank',
      cellTemplate: 'label',
      width: 90
    },
    {
      name: 'scientificName',
      label: 'taxonomy.scientific.name',
      cellTemplate: 'taxonScientificName',
      width: 200
    },
    {
      name: 'scientificNameAuthorship',
      label: 'taxonomy.author',
      width: 200
    },
    {
      name: 'vernacularName',
      label: 'taxonomy.vernacular.name',
      cellTemplate: 'multiLang',
      width: 200
    },
    {
      name: 'synonymNames',
      cellTemplate: 'cursive',
      width: 200
    },
    {
      name: 'vernacularName.fi',
      label: 'taxonomy.vernacular.name.fi',
      width: 200
    },
    {
      name: 'vernacularName.sv',
      label: 'taxonomy.vernacular.name.sv',
      width: 200
    },
    {
      name: 'vernacularName.en',
      label: 'taxonomy.vernacular.name.en',
      width: 200
    },
    {
      name: 'alternativeVernacularName',
      label: 'taxonomy.alternative.vernacular.names',
      cellTemplate: 'multiLangAll',
      width: 200
    },
    {
      name: 'obsoleteVernacularName',
      label: 'taxonomy.obsolete.vernacular.name',
      cellTemplate: 'multiLangAll',
      width: 200
    },
    {
      name: 'tradeName',
      label: 'taxonomy.trade.name',
      cellTemplate: 'multiLangAll',
      width: 200
    },
    {
      name: 'finnish',
      cellTemplate: 'boolean',
      width: 90
    },
    {
      name: 'typeOfOccurrenceInFinland',
      cellTemplate: 'labelArray'
    },
    {
      name: 'typeOfOccurrenceInFinlandNotes'
    },
    {
      name: 'occurrenceInFinlandPublication',
      cellTemplate: 'publicationArray',
      width: 200
    },
    {
      name: 'originalPublication',
      cellTemplate: 'publication',
      width: 200
    },
    {
      name: 'latestRedListStatusFinland',
      cellTemplate: 'iucnStatus',
      width: 90
    },
    {
      name: 'informalTaxonGroups',
      cellTemplate: 'labelArray',
      width: 200
    },
    {
      name: 'invasiveSpecies',
      cellTemplate: 'boolean',
      width: 90
    },
    {
      name: 'administrativeStatuses',
      cellTemplate: 'labelArray',
      width: 200
    },
    {
      name: 'taxonExpert',
      cellTemplate: 'user'
    },
    {
      name: 'notes'
    }
  ];
  columnLookup = {};

  lastQuery: string;
  private subQueryUpdate: Subscription;
  private subFetch: Subscription;

  private settingsLoaded = false;

  constructor(
    private taxonomyService: TaxonomyApi,
    private translate: TranslateService,
    private logger: Logger,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.initColumns();

    this.userService.getItem<any>(UserService.SETTINGS_TAXONOMY_LIST)
      .subscribe(data => {
        if (data && data.selected) {
          this.searchQuery.selected = data.selected;
        }
        this.settingsLoaded = true;
        this.refreshSpeciesList();
      });

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.searchQuery.page = 1;
        this.refreshSpeciesList();
      }
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
    this.searchQuery.page = event.offset + 1;
    this.refreshSpeciesList();
  }

  sortOrderChanged(event) {
    this.searchQuery.sortOrder = event;
    this.refreshSpeciesList();
  }

  refreshSpeciesList() {
    const cacheKey = JSON.stringify({
      query: this.searchQuery.query,
      page: this.searchQuery.page,
      sortOrder: this.searchQuery.sortOrder,
      selected: this.searchQuery.selected
    });
    if (this.lastQuery === cacheKey || !this.settingsLoaded || this.searchQuery.loading) {
      return;
    }
    this.lastQuery = cacheKey;

    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.loading = true;

    const query = this.searchQueryToTaxaQuery();

    this.subFetch = this.taxonomyService
      .taxonomyFindSpecies(
        query.target,
        this.translate.currentLang,
        query.informalTaxonGroupId,
        undefined,
        undefined,
        undefined,
        undefined,
        `${this.searchQuery.page}`,
        '1000',
        this.searchQuery.sortOrder,
        query.extraParameters
        // 'finnish_name'
      )
      .subscribe(data => {
          this.columns = this.searchQuery.selected.map(name => {
            return this.columnLookup[name];
          });

          if (data.lastPage && data.lastPage === 1) {
            this.columns = this.columns.map(column => ({...column, sortable: true}));
          } else {
            this.columns = this.columns.map(column => ({...column, sortable: false}));
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

  initColumns() {
    this._selected = [...this.searchQuery.selected];
    this.allColumns = this.allColumns
      .map(column => {
        this.columnLookup[column.name] = column;
        if (!column.label) {
          column.label = 'taxonomy.' + column.name;
        }
        return column;
      });
  }

  clear() {
    this._selected = [];
  }

  toggleSelectedField(field: string) {
    const idx = this._selected.indexOf(field);
    if (idx === -1) {
      this._selected = [...this._selected, field];
    } else {
      this._selected = [
        ...this._selected.slice(0, idx),
        ...this._selected.slice(idx + 1)
      ]
    }
  }

  openModal() {
    this._selected = [...this.searchQuery.selected];
    this.modalRef.show();
  }

  closeOkModal() {
    this.searchQuery.selected = [...this._selected];
    this.searchQuery.page = 1;
    this.refreshSpeciesList();
    this.saveSettings();
    this.modalRef.hide();
  }

  private searchQueryToTaxaQuery() {
    const query = this.searchQuery.query;
    const informalTaxonGroupId = query.informalTaxonGroupId;
    const target = query.target ? this.searchQuery.targetId : 'MX.37600';
    const extraParameters = {...query};
    extraParameters['target'] = undefined;
    extraParameters['informalTaxonGroupId'] = undefined;
    extraParameters['selectedFields'] = this.getSelectedFields();
    extraParameters['lang'] = 'multi';

    return {
      informalTaxonGroupId,
      target,
      extraParameters
    }
  }

  private getSelectedFields() {
    const selects = this.searchQuery.selected;

    if (selects.indexOf('id') === -1) {
      selects.push('id');
    }
    return selects.join(',');
  }

  private saveSettings() {
    this.userService.setItem(UserService.SETTINGS_TAXONOMY_LIST, {
      selected: this.searchQuery.selected
    }).subscribe(() => {}, () => {});
  }
}
