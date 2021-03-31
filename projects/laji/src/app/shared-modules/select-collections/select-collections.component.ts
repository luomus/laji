import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { map } from 'rxjs/operators';
import { CollectionService, ICollectionRange, ICollectionsTreeNode } from '../../shared/service/collection.service';
import { SelectCollectionsModalComponent } from './select-collections-modal/select-collections-modal.component';
import { Observable, zip } from 'rxjs';

export interface SelectedOption {
  id: any;
  value: any;
}

@Component({
  selector: 'laji-select-collections',
  templateUrl: './select-collections.component.html',
  styleUrls: ['./select-collections.component.scss']
})
export class SelectCollectionsComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() query: Record<string, any>;
  @Input() info: string;
  @Input() modalButtonLabel: string;
  @Input() modalTitle: string;
  @Input() browseTitle: string;
  @Input() selectedTitle: string;
  @Input() okButtonLabel: string;
  @Input() clearButtonLabel: string;
  @Input() open = false;
  @Output() selectedOptionsChange = new EventEmitter<string[]>();

  collectionsTree$: Observable<ICollectionsTreeNode[]> = null;
  collections$: Observable<ICollectionRange[]> = null;

  lang: string;
  modalRef: BsModalRef;
  selectedOptions: string[] = [];

  constructor(
    private modalService: BsModalService,
    private collectionService: CollectionService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    if (this.query?.collectionId?.length !== 0) {
      this.open = true;
    }
  }

  ngOnChanges() {
    this.lang = this.translate.currentLang;
    this.collectionsTree$ = this.initCollectionsTree();
    this.collections$ = this.initCollections();
    this.selectedOptions = this.query?.collectionId || [];
  }

  toggle(event) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
  }

  openModal() {
    const initialState = {
      selected: this.selectedOptions,
      collectionsTree$: this.collectionsTree$,
      modalTitle: this.modalTitle,
      browseTitle: this.browseTitle,
      selectedTitle: this.selectedTitle,
      okButtonLabel: this.okButtonLabel,
      clearButtonLabel: this.clearButtonLabel,
    };
    this.modalRef = this.modalService.show(SelectCollectionsModalComponent, { class: 'modal-lg', initialState });
    this.modalRef.content.emitConfirm.subscribe(result => {
      this.selectedOptionsChange.emit(result);
    });
  }

  deselect(id: string) {
    this.selectedOptionsChange.emit(this.selectedOptions.filter(option => option !== id));
  }

  initCollectionsTree() {
    const { collectionId, ...query } = this.query;

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

  buildTree(tree, allAggregates, filteredAggragates) {
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
          ...tree,
          children,
          count: filteredAggragate ? filteredAggragate.count + childCount : childCount
        };
      } else if (allAggregate) {
        return {
          ...tree,
          hasChildren: false,
          children: [],
          count: filteredAggragate ? filteredAggragate.count : 0
        };
      }
    } else if (allAggregate) {
      return {
        ...tree,
        count: filteredAggragate ? filteredAggragate.count : 0
      };
    }
  }

  initCollections(): Observable<ICollectionRange[]> {
    return this.collectionService.getAll(this.lang, false).pipe(
      map(data => data.filter(item => this.selectedOptions.includes(item.id)))
    );
  }
}
