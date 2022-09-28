import { Component, OnInit, ChangeDetectionStrategy, OnChanges, Output, Input, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectedOption, TreeOptionsNode } from '../../tree-select/tree-select.component';
import { CollectionService } from '../../../shared/service/collection.service';

@Component({
  selector: 'laji-dataset-metadata-browser',
  templateUrl: './dataset-metadata-browser.component.html',
  styleUrls: ['./dataset-metadata-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataBrowserComponent implements OnInit {
  @Input() selected: string;
  @Output() selectedChange = new EventEmitter<string>();

  collectionsCount = 0;
  selectedOption: SelectedOption[] = [];
  optionsTree: TreeOptionsNode[] = null;
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

  ngOnInit() {
    this.setupTree()
  }

  toggleShowEmpty() {
    this.collectionsCount = 0;
    this.showEmpty = !this.showEmpty;
    this.setupTree();
  }

  setupTree() {
    this.loading = true;
    this.cd.markForCheck();
    this.initCollectionsTree().subscribe(data => {
      this.optionsTree = data;
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  initCollectionsTree() {
    return zip(
      this.collectionService.getCollectionsTree(),
      this.collectionService.getCollectionsAggregate(),
    ).pipe(
      map(([ tree, agregates ]) => this.buildCollectionTree(tree, agregates))
    );
  }

  buildCollectionTree(trees: any[], aggregates: any[]) {
    const collectionsWithChildren = [];

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

  buildTree(tree, aggregates): TreeOptionsNode {
    const aggregate = aggregates.find(elem => elem.id === tree.id);

    if (this.excludedTypes.includes(tree.collectionsType)) {
      return undefined
    }

    if (tree.hasChildren) {
      const children = [];
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

        this.collectionsCount++

        if (this.selected && tree.id === this.selected) {
          this.selectedOption = [{
            id: this.selected,
            value: tree.longName,
            type: 'included',
          }];
        }

        return {
          id: tree.id,
          name: tree.longName,
          children,
          quality: tree.collectionQuality,
          count: aggregate ? aggregate.count + childCount : childCount
        };
      } else if (aggregate) {
        this.collectionsCount++

        return {
          id: tree.id,
          name: tree.longName,
          quality: tree.collectionQuality,
          count: aggregate.count
        };
      }
    } else if (aggregate) {
      this.collectionsCount++

      return {
        id: tree.id,
        name: tree.longName,
        quality: tree.collectionQuality,
        count: aggregate.count
      };
    } else if (this.showEmpty) {
      this.collectionsCount++

      return {
        id: tree.id,
        name: tree.longName,
        quality: tree.collectionQuality,
        count: 0
      }
    }

    return undefined;
  }

  changeSelected(value) {
    this.selected = value[0]?.id;
    this.selectedChange.emit(this.selected);
  }
}
