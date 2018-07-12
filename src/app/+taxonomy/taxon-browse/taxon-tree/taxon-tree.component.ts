import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { of as ObservableOf, Observable, Subscription, forkJoin as ObservableForkJoin } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TreeTableComponent } from './tree-table/tree-table.component'
import { SpeciesListOptionsModalComponent } from '../species-list-options-modal/species-list-options-modal.component';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TaxonomyColumns } from '../taxonomy-columns.model';

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

  @ViewChild('treeTable') private tree: TreeTableComponent;
  @ViewChild('settingsModal') settingsModal: SpeciesListOptionsModalComponent;

  public hideLowerRanks = false;

  private subQueryUpdate: Subscription;

  constructor(
    private taxonService: TaxonomyApi,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (TaxonTreeComponent.cache) {
      this.nodes = TaxonTreeComponent.cache;
    }

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.getRoot();
      }
    );
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
      })
      .pipe(
        switchMap(children => {
          return this.skipTaxonRanks(children);
        }),
        map(result => [].concat(...result))
      )
  }

  onSettingsLoaded() {
    this.getRoot();
  }

  openSettingsModal() {
    this.settingsModal.openModal();
  }

  onCloseSettingsModal() {
    this.getRoot();
  }

  private skipTaxonRanks(children) {
    if (children.length < 1) {
      return ObservableOf([children]);
    }

    return ObservableForkJoin(children.map(child => {
      if (!this.hideLowerRanks || (child.taxonRank !== 'MX.subfamily' && child.taxonRank !== 'MX.genus')) {
        return ObservableOf([child]);
      } else if (!child.hasChildren) {
        return ObservableOf([]);
      } else {
        return this.taxonService
          .taxonomyFindChildren(child.id, 'multi', undefined, {
            selectedFields: this.getSelectedFields(),
            onlyFinnish: this.searchQuery.query.onlyFinnish
          })
          .pipe(switchMap(children2 => {
            return this.skipTaxonRanks(children2)
              .pipe(map(result => ([].concat(...result))));
          }));
      }
    }));
  }

  onHideLowerRanksClick() {
    this.getRoot();
  }

  onRowSelect(event: any) {
    if (event.row && event.row.id) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', event.row.id]));
    }
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
}
