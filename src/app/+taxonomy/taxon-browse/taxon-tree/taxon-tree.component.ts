import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TreeTableComponent } from './tree-table/tree-table.component'
import { SpeciesListOptionsModalComponent } from '../species-list-options-modal/species-list-options-modal.component';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TaxonomyColumns } from '../service/taxonomy-columns';
import { SpeciesDownloadComponent } from '../species-download/species-download.component';
import { TaxonExportService } from '../service/taxon-export.service';

@Component({
  selector: 'laji-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent implements OnInit, OnDestroy {
  @Input() searchQuery: TaxonomySearchQuery;
  @Input() columnService: TaxonomyColumns;

  public root = [];
  public columns: ObservationTableColumn[] = [];
  public getChildrenFunc = this.getChildren.bind(this);
  public getParentsFunc = this.getParents.bind(this);
  public skipParams: {key: string, values: string[]}[];

  @ViewChild('treeTable') private tree: TreeTableComponent;
  @ViewChild('settingsModal') settingsModal: SpeciesListOptionsModalComponent;
  @ViewChild('speciesDownload') speciesDownload: SpeciesDownloadComponent;

  public taxonSelectFilters: {onlyFinnish: boolean};

  public hideLowerRanks = false;
  public openId: string;

  public downloadLoading = false;

  private subQueryUpdate: Subscription;

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
        this.root = [...this.root];
      }
    );
  }

  onSettingsLoaded() {
    this.getRoot();
  }

  ngOnDestroy() {
    this.subQueryUpdate.unsubscribe();
  }

  getRoot(): Subscription {
    return this.taxonService
      .taxonomyFindBySubject('MX.37600', 'multi', {
        selectedFields: this.getSelectedFields(),
        onlyFinnish: this.searchQuery.query.onlyFinnish
      })
      .pipe(
        map(data => [data]),
        tap((data) => {
          this.root = data;
          this.columns = this.columnService.getColumns(this.searchQuery.treeOptions.selected);
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
      });
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
    this.getRoot();
  }

  onHideLowerRanksClick() {
    if (this.hideLowerRanks) {
      this.skipParams = [{key: 'taxonRank', values: ['MX.subfamily', 'MX.genus']}];
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

  private getSelectedFields() {
    const compulsory = ['id', 'scientificName', 'cursiveName', 'hasChildren'];

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
    this.openId = key;
  }
}
