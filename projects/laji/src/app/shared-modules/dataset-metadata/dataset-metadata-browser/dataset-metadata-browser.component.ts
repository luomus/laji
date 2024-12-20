import { Component, ChangeDetectionStrategy, OnChanges, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectedOption } from '../../tree-select/tree-select.component';
import { CollectionService, CollectionTreeOptionsNode, ICollectionAggregate, ICollectionsTreeNode } from '../../../shared/service/collection.service';

@Component({
  selector: 'laji-dataset-metadata-browser',
  templateUrl: './dataset-metadata-browser.component.html',
  styleUrls: ['./dataset-metadata-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataBrowserComponent implements OnChanges {
  @Input() selected?: string;
  @Input() isMobile?: boolean;
  @Output() selectedChange = new EventEmitter<string>();

  collectionsCount = 0;
  _selected?: string;
  selectedOption: SelectedOption[] = [];
  optionsTree: CollectionTreeOptionsNode[] = [];
  lang: string;
  showEmpty = false;
  loading = false;
  excludedTypes = [
    'MY.collectionTypeGardenArea',
    'MY.collectionTypeIndoorGardenArea',
    'MY.collectionTypeOutdoorGardenArea',
    'MY.collectionTypeGardenSublocation'

  ];

  constructor(
    private collectionService: CollectionService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    this.lang = this.translate.currentLang;
  }

  ngOnChanges() {
    if (!this._selected || this.selected !== this._selected) {
      this.setupTree();
      this._selected = this.selected;
    }
  }

  toggleShowEmpty() {
    this.collectionsCount = 0;
    this.showEmpty = !this.showEmpty;
    this.setupTree();
  }

  setupTree() {
    this.loading = true;
    this.cd.markForCheck();
    this.initCollectionsTree$().subscribe(data => {
      this.optionsTree = data;
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  initCollectionsTree$() {
    return zip(
      this.collectionService.getCollectionsTree$(),
      this.collectionService.getCollectionsAggregate$(),
    ).pipe(
      map(([ tree, aggregates ]) => this.buildCollectionTree(tree, aggregates))
    );
  }

  buildCollectionTree(trees: ICollectionsTreeNode[], aggregates: ICollectionAggregate[]) {
    const collectionsWithChildren: CollectionTreeOptionsNode[] = [];

    if (this.selected) {
      const aggregate = aggregates.find(elem => elem.id === this.selected);

      if (!aggregate || aggregate.count === 0) {
        this.showEmpty = true;
      }
    }

    trees.forEach(tree => {
      const prunedTree = this.buildTree(tree, aggregates);

      if (prunedTree) {
        collectionsWithChildren.push(prunedTree);
      }
    });

    collectionsWithChildren.sort((a, b) => {
      const diff = b.count - a.count;

      if (diff) {
        return diff;
      }

      return a.name > b.name ? 1 : -1;
    });

    return collectionsWithChildren;
  }

  buildTree(tree: ICollectionsTreeNode, aggregates: ICollectionAggregate[]): CollectionTreeOptionsNode|undefined {
    const aggregate = aggregates.find(elem => elem.id === tree.id);

    if (this.excludedTypes.includes(tree.collectionType)) {
      return undefined;
    }

    if ((this.selected && tree.id === this.selected) && (tree.hasChildren || aggregate || this.showEmpty)) {
      this.selectedOption = [{
        id: this.selected,
        value: tree.longName,
        type: 'included',
      }];
    }

    if (tree.hasChildren) {
      const children: CollectionTreeOptionsNode[] = [];
      let childCount = 0;
      tree.children?.forEach(child => {
        const childTree = this.buildTree(child, aggregates);

        if (childTree) {
          children.push(childTree);
          childCount += childTree.count;
        }
      });

      if (children.length !== 0) {
        children.sort((a, b) => {
          const diff = b.count - a.count;

          if (diff) {
            return diff;
          }

          return a.name > b.name ? 1 : -1;
        });

        this.collectionsCount++;

        return {
          id: tree.id,
          name: tree.longName,
          children,
          quality: tree.collectionQuality,
          count: aggregate ? aggregate.count + childCount : childCount
        };
      } else if (aggregate) {
        this.collectionsCount++;

        return {
          id: tree.id,
          name: tree.longName,
          quality: tree.collectionQuality,
          count: aggregate.count
        };
      }
    } else if (aggregate) {
      this.collectionsCount++;

      return {
        id: tree.id,
        name: tree.longName,
        quality: tree.collectionQuality,
        count: aggregate.count
      };
    } else if (this.showEmpty) {
      this.collectionsCount++;

      return {
        id: tree.id,
        name: tree.longName,
        quality: tree.collectionQuality,
        count: 0
      };
    }

    return undefined;
  }

  changeSelected(value: SelectedOption[]) {
    this.selected = value[0]?.id;
    this._selected = this.selected;
    this.selectedChange.emit(this.selected);
  }
}
