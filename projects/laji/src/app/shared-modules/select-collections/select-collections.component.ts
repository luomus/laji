import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { map, switchMap } from 'rxjs/operators';
import { CollectionService, ICollectionRange, ICollectionsTreeNode } from '../../shared/service/collection.service';
import { SelectCollectionsModalComponent } from './select-collections-modal/select-collections-modal.component';
import { Observable } from 'rxjs';

export interface SelectOption {
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
  @Input() selectedOptions: string[] = [];
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

  constructor(
    private modalService: BsModalService,
    private collectionService: CollectionService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    if (this.selectedOptions?.length !== 0) {
      this.open = true;
    }
  }

  ngOnChanges() {
    this.lang = this.translate.currentLang;
    this.collectionsTree$ = this.initCollectionsTree();
    this.collections$ = this.initCollections();
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
    return this.collectionService.getCollectionsTree().pipe(
      switchMap((outer) => this.collectionService.getCollectionsAggregate().pipe(
        map(inner => this.buildCollectionTree(outer, inner))
      ))
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

    collectionsWithChildren.sort((a, b) => b.count - a.count);

    return collectionsWithChildren;
  }

  buildTree(tree, aggregates) {
    const aggregate = aggregates.find(elem => elem.id === tree.id);

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
        children.sort((a, b) => b.count - a.count);

        return {
          ...tree,
          children,
          count: aggregate ? aggregate.count + childCount : childCount
        };
      } else if (aggregate) {
        return {
          ...tree,
          hasChildren: false,
          children: [],
          count: aggregate.count
        };
      }
    } else if (aggregate) {
      return {
        ...tree,
        count: aggregate.count
      };
    }
  }

  initCollections(): Observable<ICollectionRange[]> {
    return this.collectionService.getAll(this.lang, false).pipe(
      map(data => data.filter(item => this.selectedOptions.includes(item.id)))
    );
  }
}
