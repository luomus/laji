import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { of as ObservableOf, Observable, Subscription, forkJoin as ObservableForkJoin } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TreeTableComponent } from './tree-table/tree-table.component'

@Component({
  selector: 'laji-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent implements OnInit, OnDestroy {
  private static cache;

  @Input() searchQuery: TaxonomySearchQuery;

  public nodes = [];
  public columns = [
    {
      name: 'scientificName',
      selectField: 'scientificName,cursiveName',
      label: 'taxonomy.scientific.name',
      cellTemplate: 'taxonScientificName',
      width: 200
    },
    {
      name: 'id',
      label: 'taxonomy.card.id',
      width: 95
    }
  ];

  @ViewChild('treeTable') private tree: TreeTableComponent;
  private selectedFields  = 'id,hasChildren,scientificName,vernacularName,taxonRank';

  public hideLowerRanks = false;

  public getChildrenFunc = this.getChildren.bind(this);
  private subQueryUpdate: Subscription;

  constructor(
    private taxonService: TaxonomyApi,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (TaxonTreeComponent.cache) {
      this.nodes = TaxonTreeComponent.cache;
    } else {
      this.getRoot()
        .subscribe(() => {
          this.cd.markForCheck();
        }, (error) => {
          console.error(error);
        });
    }

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.getRoot().subscribe(() => {
          this.cd.markForCheck();
        });
      }
    );
  }

  ngOnDestroy() {
    TaxonTreeComponent.cache = this.tree.nodes;
    this.subQueryUpdate.unsubscribe();
  }

  getRoot(): Observable<any[]> {
    return this.taxonService
      .taxonomyFindBySubject('MX.37600', 'multi', {selectedFields: this.selectedFields, onlyFinnish: this.searchQuery.query.onlyFinnish})
      .pipe(
        map(data => [data]),
        tap((data) => {
          this.nodes = data;
        })
      );
  }

  getChildren(id: string) {
    return this.taxonService
      .taxonomyFindChildren(id, 'multi', undefined, {
        selectedFields: this.selectedFields,
        onlyFinnish: this.searchQuery.query.onlyFinnish
      })
      .pipe(
        switchMap(children => {
          return this.skipTaxonRanks(children);
        }),
        map(result => [].concat(...result))
      )
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
            selectedFields: this.selectedFields,
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
    this.getRoot().subscribe(() => {
        this.cd.markForCheck();
      }
    )
  }
}
