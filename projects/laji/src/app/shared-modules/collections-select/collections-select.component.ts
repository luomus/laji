import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { CollectionService, CollectionTreeOptionsNode, ICollectionAggregate, ICollectionsTreeNode } from '../../shared/service/collection.service';
import { BehaviorSubject, Observable, zip, of } from 'rxjs';
import { SelectedOption, TreeOptionsChangeEvent } from '../tree-select/tree-select.component';
import { Util } from '../../shared/service/util.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-collections-select',
  templateUrl: './collections-select.component.html',
  styleUrls: ['./collections-select.component.scss']
})
export class CollectionsSelectComponent implements OnInit, OnChanges {
  @Input() title!: string;
  @Input() query!: WarehouseQueryInterface;
  @Input() info!: string;
  @Input() modalButtonLabel!: string;
  @Input() modalTitle!: string;
  @Input() browseTitle!: string;
  @Input() selectedTitle!: string;
  @Input() includedTitle!: string;
  @Input() excludedTitle!: string;
  @Input() okButtonLabel!: string;
  @Input() clearButtonLabel!: string;
  @Input() open = false;
  @Output() collectionIdChange = new EventEmitter<{
    collectionId?: string[];
    collectionIdNot?: string[];
  }>();

  collectionsTree$!: Observable<CollectionTreeOptionsNode[]>;
  collections$!: Observable<SelectedOption[]>;

  includedOptions: string[] = [];
  excludedOptions: string[] = [];

  private filterQuery$: Observable<WarehouseQueryInterface|undefined>;
  private filterQuerySubject = new BehaviorSubject<WarehouseQueryInterface|undefined>(undefined);

  constructor(
    private collectionService: CollectionService,
    private translate: TranslateService
  ) {
    this.filterQuery$ = this.filterQuerySubject.asObservable().pipe(
      distinctUntilChanged((a, b) =>
        JSON.stringify(a) === JSON.stringify(b)
      )
    );
  }

  ngOnInit() {
    this.collections$ = this.initCollections(this.translate.currentLang, this.includedOptions, this.excludedOptions);
    this.collectionsTree$ = this.initCollectionsTree();
  }

  ngOnChanges() {
    if (this.query?.collectionId?.length !== 0) {
      this.open = true;
    }

    const includedOptions = this.query?.collectionId || [];
    const excludedOptions = this.query?.collectionIdNot || [];
    if (!Util.equalsArray(this.includedOptions, includedOptions) || !Util.equalsArray(this.excludedOptions, excludedOptions)) {
      this.includedOptions = includedOptions;
      this.excludedOptions = excludedOptions;
      this.collections$ = this.initCollections(this.translate.currentLang, this.includedOptions, this.excludedOptions);
    }

    const { collectionId, collectionIdNot, ...query } = this.query;
    this.filterQuerySubject.next(query);
  }

  toggle(event: Event) {
    if ((event.target as HTMLElement)?.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
  }

  selectedOptionsChange($event: TreeOptionsChangeEvent) {
    this.includedOptions = $event.selectedId ?? [];
    this.excludedOptions = $event.selectedIdNot ?? [];

    this.collectionIdChange.emit({
      collectionId: this.includedOptions,
      collectionIdNot: this.excludedOptions
    });
  }

  initCollectionsTree() {
    const tree$ = this.collectionService.getCollectionsTree$().pipe(shareReplay(1));
    const aggregate$ = this.collectionService.getCollectionsAggregate$().pipe(shareReplay(1));

    return this.filterQuery$.pipe(
      switchMap(query =>
        zip(
          tree$,
          aggregate$,
          this.collectionService.getCollectionsAggregate$(query)
        ).pipe(
          map(([ tree, allAgregates, filteredAggragates ]) => this.buildCollectionTree(tree, allAgregates, filteredAggragates))
        )
      )
    );
  }

  buildCollectionTree(trees: ICollectionsTreeNode[], allAggregates: ICollectionAggregate[], filteredAggragates: ICollectionAggregate[]) {
    const collectionsWithChildren: CollectionTreeOptionsNode[] = [];

    trees.forEach(tree => {
      const prunedTree = this.buildTree(tree, allAggregates, filteredAggragates);

      if (prunedTree) {
        collectionsWithChildren.push(prunedTree);
      }
    });

    collectionsWithChildren.sort((a, b) => b.count - a.count);

    return collectionsWithChildren;
  }

  buildTree(tree: ICollectionsTreeNode, allAggregates: ICollectionAggregate[], filteredAggragates: ICollectionAggregate[]): CollectionTreeOptionsNode|undefined {
    const allAggregate = allAggregates.find(elem => elem.id === tree.id);
    const filteredAggragate = filteredAggragates.find(elem => elem.id === tree.id);

    if (tree.hasChildren) {
      const children: CollectionTreeOptionsNode[] = [];
      let childCount = 0;
      tree.children?.forEach(child => {
        const childTree = this.buildTree(child, allAggregates, filteredAggragates);

        if (childTree) {
          children.push(childTree);
          childCount += childTree.count;
        }
      });

      if (children.length !== 0) {
        children.sort((a, b) => b.count - a.count);

        return {
          id: tree.id,
          name: tree.longName,
          children,
          count: filteredAggragate ? filteredAggragate.count + childCount : childCount
        };
      } else if (allAggregate) {
        return {
          id: tree.id,
          name: tree.longName,
          count: filteredAggragate ? filteredAggragate.count : 0
        };
      }
    } else if (allAggregate) {
      return {
        id: tree.id,
        name: tree.longName,
        count: filteredAggragate ? filteredAggragate.count : 0
      };
    }
    return undefined;
  }

  initCollections(lang: string, includedOptions: string[], excludedOptions: string[]): Observable<SelectedOption[]> {
    if (includedOptions.length === 0 && excludedOptions.length === 0) {
      return of([]);
    }

    const allCollections$ = this.collectionService.getAll$(lang, false).pipe(shareReplay(1));

    return allCollections$.pipe(
      map(data => {
        const toReturn: SelectedOption[] = [];
        data.forEach(item => {
          if (includedOptions.includes(item.id)) {
            toReturn.push({
              ...item,
              type: 'included'
            });
          } else if (excludedOptions.includes(item.id)) {
            toReturn.push({
              ...item,
              type: 'excluded'
            });
          }
        });
        return toReturn;
      })
    );
  }
}
