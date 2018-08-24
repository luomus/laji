import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TreeTableComponent } from './tree-table/tree-table.component';
import { SpeciesListOptionsModalComponent } from '../species-list-options-modal/species-list-options-modal.component';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TaxonomyColumns } from '../service/taxonomy-columns';
import { SpeciesDownloadComponent } from '../species-download/species-download.component';
import { TaxonExportService } from '../service/taxon-export.service';
import { TreeNode } from './tree-table/model/tree-node.interface';
import { Taxonomy } from '../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent implements OnInit, OnChanges, OnDestroy {
  private static cache: {
    nodes: TreeNode[],
    activeId: string,
    showMainLevels: boolean,
    lastQuery: string
  };

  @Input() searchQuery: TaxonomySearchQuery;
  @Input() columnService: TaxonomyColumns;
  @Input() visible: boolean;

  public nodes: any[] = [];
  public columns: ObservationTableColumn[] = [];
  public getChildrenFunc = this.getChildren.bind(this);
  public getParentsFunc = this.getParents.bind(this);
  public skipParams: {key: string, values: string[], isWhiteList?: boolean}[];

  public showMainLevels = false;
  public taxon: string;
  public activeId: string;

  @ViewChild('treeTable') private tree: TreeTableComponent;
  @ViewChild('settingsModal') settingsModal: SpeciesListOptionsModalComponent;
  @ViewChild('speciesDownload') speciesDownload: SpeciesDownloadComponent;

  public taxonSelectFilters: {onlyFinnish: boolean};
  public downloadLoading = false;

  private subQueryUpdate: Subscription;
  private lastQuery: string;

  static emptyCache() {
    TaxonTreeComponent.cache = undefined;
  }

  constructor(
    private taxonService: TaxonomyApi,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef,
    private taxonExportService: TaxonExportService
  ) {}

  ngOnInit() {
    this.taxonSelectFilters = {onlyFinnish: this.searchQuery.query.onlyFinnish};

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.taxonSelectFilters = {onlyFinnish: this.searchQuery.query.onlyFinnish};
        this.getRoot();
      }
    );
  }

  onSettingsLoaded() {
    this.columns = this.columnService.getColumns(this.searchQuery.treeOptions.selected);

    const cacheKey = JSON.stringify({
      onlyFinnish: this.searchQuery.query.onlyFinnish,
      selected: this.searchQuery.treeOptions.selected
    });

    if (TaxonTreeComponent.cache && TaxonTreeComponent.cache.lastQuery === cacheKey) {
      this.nodes = TaxonTreeComponent.cache.nodes;
      this.activeId = TaxonTreeComponent.cache.activeId;
      this.taxon = this.activeId;
      this.showMainLevels = TaxonTreeComponent.cache.showMainLevels;
      this.setSkipParams();
      this.lastQuery = cacheKey;
    } else {
      this.getRoot();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visible && this.visible) {
      this.tree.refreshTable();
    }
  }

  ngOnDestroy() {
    TaxonTreeComponent.cache = {
      nodes: this.tree.getVisibleNodes(),
      activeId: this.activeId,
      showMainLevels: this.showMainLevels,
      lastQuery: this.lastQuery
    };
    this.subQueryUpdate.unsubscribe();
  }

  getRoot(): Subscription {
    const cacheKey = JSON.stringify({
      onlyFinnish: this.searchQuery.query.onlyFinnish,
      selected: this.searchQuery.treeOptions.selected
    });
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;

    if (this.nodes && this.nodes.length > 0) {
      this.nodes = [{...this.nodes[0], children: undefined}];
      return;
    }

    this.taxonService
      .taxonomyFindBySubject('MX.37600', 'multi', {
        selectedFields: this.getSelectedFields(),
        onlyFinnish: this.searchQuery.query.onlyFinnish
      })
      .pipe(
        map(data => this.mapSpeciesCountsToLeafCounts([data])),
        tap((data) => {
          this.nodes = data;
        })
      )
      .subscribe(() => {
        this.cd.markForCheck();
      });
  }

  getChildren(id: string) {
    return this.taxonService
      .taxonomyFindChildren(id, 'multi', undefined, {
        selectedFields: this.getSelectedFields(),
        onlyFinnish: this.searchQuery.query.onlyFinnish
      })
      .pipe(
        map(data => this.mapSpeciesCountsToLeafCounts(data))
      )
  }

  getParents(id: string) {
    return this.taxonService
      .taxonomyFindParents(id, 'multi', {
        selectedFields: 'id',
        onlyFinnish: this.searchQuery.query.onlyFinnish
      });
  }

  openSettingsModal() {
    this.settingsModal.openModal();
  }

  onCloseSettingsModal() {
    this.columns = this.columnService.getColumns(this.searchQuery.treeOptions.selected);
    this.getRoot();
  }

  setSkipParams() {
    if (this.showMainLevels) {
      this.skipParams = [{key: 'taxonRank', isWhiteList: true, values: [
        'MX.superdomain',
        'MX.domain',
        'MX.kingdom',
        'MX.phylum',
        'MX.class',
        'MX.order',
        'MX.family',
        'MX.genus',
        'MX.species'
      ]}];
    } else {
      this.skipParams = undefined;
    }
  }

  onRowSelect(event: any) {
    if (event.row && event.row.id) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', event.row.id]));
    }
  }

  download(fileType: string) {
    this.downloadLoading = true;

    const columns = this.columnService.getColumns(this.searchQuery.treeOptions.selected);

    this.taxonExportService.downloadTaxons(columns, this.tree.rows, fileType)
      .subscribe(() => {
        this.downloadLoading = false;
        this.speciesDownload.modal.hide();
        this.cd.markForCheck();
    });
  }

  private mapSpeciesCountsToLeafCounts(taxons: Taxonomy[]) {
    return taxons.map(taxon => ({
      ...taxon,
      leafCount: this.searchQuery.query.onlyFinnish ? taxon.countOfFinnishSpecies : taxon.countOfSpecies,
      countOfSpecies: undefined,
      countOfFinnishSpecies: undefined
    }));
  }

  private getSelectedFields() {
    const compulsory = ['id', 'taxonRank', 'hasChildren', this.searchQuery.query.onlyFinnish ? 'countOfFinnishSpecies' : 'countOfSpecies'];

    const selects = this.searchQuery.treeOptions.selected.reduce((arr, field) => {
      let addedField = field;
      if (this.columnService.columnLookup[field] && this.columnService.columnLookup[field].selectField) {
        addedField = this.columnService.columnLookup[field].selectField;
      }
      if (arr.indexOf(addedField) === -1) {
        arr.push(addedField);
      }
      return arr;
    }, []);

    for (let i = 0; i < compulsory.length; i++) {
      if (selects.indexOf(compulsory[i]) === -1) {
        selects.push(compulsory[i]);
      }
    }

    return selects.join(',');
  }

  onTaxonSelect(key: string) {
    this.activeId = key;
    this.tree.openTreeById(key);
  }
}
