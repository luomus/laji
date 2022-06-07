import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { CollectionService } from '../../shared/service/collection.service';
import { Observable, zip } from 'rxjs';
import { SelectedOption, TreeOptionsChangeEvent, TreeOptionsNode } from '../tree-select/tree-select.component';

@Component({
  selector: 'laji-collections-select',
  templateUrl: './collections-select.component.html',
  styleUrls: ['./collections-select.component.scss']
})
export class CollectionsSelectComponent implements OnChanges {
  @Input() title: string;
  @Input() query: Record<string, any>;
  @Input() info: string;
  @Input() modalButtonLabel: string;
  @Input() modalTitle: string;
  @Input() browseTitle: string;
  @Input() selectedTitle: string;
  @Input() includedTitle: string;
  @Input() excludedTitle: string;
  @Input() okButtonLabel: string;
  @Input() clearButtonLabel: string;
  @Input() open = false;
  @Output() collectionIdChange = new EventEmitter<{
    collectionId?: string[];
    collectionIdNot?: string[];
  }>();

  collectionsTree$: Observable<TreeOptionsNode[]> = null;
  collections$: Observable<SelectedOption[]> = null;

  lang: string;
  includedOptions: string[] = [];
  excludedOptions: string[] = [];

  constructor(
    private collectionService: CollectionService,
    private translate: TranslateService
  ) {
    this.lang = this.translate.currentLang;
  }

  ngOnChanges() {
    if (this.query?.collectionId?.length !== 0) {
      this.open = true;
    }

    this.includedOptions = this.query?.collectionId || [];
    this.excludedOptions = this.query?.collectionIdNot || [];

    this.collectionsTree$ = this.initCollectionsTree();
    this.collections$ = this.initCollections();
  }

  toggle(event) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
  }

  selectedOptionsChange($event: TreeOptionsChangeEvent) {
    this.collectionIdChange.emit({
      collectionId: $event.selectedId,
      collectionIdNot: $event.selectedIdNot
    });
  }

  initCollectionsTree() {
    const { collectionId, collectionIdNot, ...query } = this.query;

    return zip(
      this.collectionService.getCollectionsTree(),
      this.collectionService.getCollectionsAggregate(),
      this.collectionService.getCollectionsAggregate(query)
    ).pipe(
      map(([ tree, allAgregates, filteredAggragates ]) => this.buildCollectionTree(tree, allAgregates, filteredAggragates))
    );
  }

  buildCollectionTree(trees: any[], allAggregates: any[], filteredAggragates: any[]) {
    const collectionsWithChildren = [];

    trees.forEach(tree => {
      const prunedTree = this.buildTree(tree, allAggregates, filteredAggragates);

      if (prunedTree) {
        collectionsWithChildren.push(prunedTree);
      }
    });

    collectionsWithChildren.sort((a, b) => b.count - a.count);

    return collectionsWithChildren;
  }

  buildTree(tree, allAggregates, filteredAggragates): TreeOptionsNode {
    const allAggregate = allAggregates.find(elem => elem.id === tree.id);
    const filteredAggragate = filteredAggragates.find(elem => elem.id === tree.id);

    if (tree.hasChildren) {
      const children = [];
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

  initCollections(): Observable<SelectedOption[]> {
    return this.collectionService.getAll(this.lang, false).pipe(
      map(data => {
        const toReturn: SelectedOption[] = [];
        data.forEach(item => {
          if (this.includedOptions.includes(item.id)) {
            toReturn.push({
              ...item,
              type: 'included'
            });
          } else if (this.excludedOptions.includes(item.id)) {
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
