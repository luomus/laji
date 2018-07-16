import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription, Observable, of as ObservableOf } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TreeTableComponent } from './tree-table/tree-table.component'
import { SpeciesListOptionsModalComponent } from '../species-list-options-modal/species-list-options-modal.component';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TaxonomyColumns } from '../taxonomy-columns.model';
import { SpeciesDownloadComponent } from '../species-download/species-download.component';
import { TaxonExportService } from '../taxon-export.service';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent implements OnInit, OnDestroy {
  private static cache;

  @Input() searchQuery: TaxonomySearchQuery;
  @Input() columnService: TaxonomyColumns;

  public nodes = [];
  public columns: ObservationTableColumn[] = [];
  public getChildrenFunc = this.getChildren.bind(this);
  public getParentsFunc = this.getParents.bind(this);
  public skipParams: {key: string, values: string[]}[];

  @ViewChild('treeTable') private tree: TreeTableComponent;
  @ViewChild('settingsModal') settingsModal: SpeciesListOptionsModalComponent;
  @ViewChild('speciesDownload') speciesDownload: SpeciesDownloadComponent;

  public hideLowerRanks = false;

  public openTaxon: string;
  public openId: string;
  public typeaheadLimit = 10;
  public typeaheadLoading = false;
  public dataSource: Observable<any>;

  public downloadLoading = false;

  private subQueryUpdate: Subscription;

  constructor(
    private taxonService: TaxonomyApi,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef,
    private taxonExportService: TaxonExportService,
    private lajiApi: LajiApiService,
    private translate: TranslateService
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.openTaxon);
    })
      .distinctUntilChanged()
      .switchMap((token: string) => this.getTaxa(token))
      .switchMap((data) => {
        if (this.openTaxon) {
          return ObservableOf(data);
        }
        return ObservableOf([]);
      });
  }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.getRoot();
      }
    );
  }

  onSettingsLoaded() {
    if (TaxonTreeComponent.cache) {
      this.nodes = TaxonTreeComponent.cache;
      this.columns = this.columnService.getColumns(this.searchQuery.treeOptions.selected);
    } else {
      this.getRoot();
    }
  }

  ngOnDestroy() {
    TaxonTreeComponent.cache = this.tree.nodes;
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
          this.nodes = data;
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

    const columns = this.columnService.getColumns(this.searchQuery.listOptions.selected);

    this.taxonExportService.downloadTaxons(columns, this.tree.rows, fileType)
      .subscribe(() => {
        this.downloadLoading = false;
        this.speciesDownload.modal.hide();
        this.cd.markForCheck();
    });
  }

  private getSelectedFields() {
    const compulsory = ['id', 'taxonRank', 'hasChildren'];

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

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  onTaxonSelect(event) {
    if (event.item && event.item.key) {
      this.openId = event.item.key;
    }
    if (this.openTaxon === '') {
      this.openId = undefined;
    }
  }

  public getTaxa(token: string): Observable<any> {
    return this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'taxon', {
      q: token,
      limit: '' + this.typeaheadLimit,
      lang: this.translate.currentLang,
      onlyFinnish: this.searchQuery.query.onlyFinnish
    });
  }
}
