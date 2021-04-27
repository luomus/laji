import { Component, Input, OnInit, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ITreeOptions, ITreeState, KEYS, TreeComponent, TreeModel, TreeNode, TREE_ACTIONS } from '@circlon/angular-tree-component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SelectedOption } from '../select-collections.component';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { toHtmlInputElement } from '../../../shared/service/html-element.service';
import { ICollectionsTreeNode } from '../../../shared/service/collection.service';
import { CheckboxType } from '../../select/checkbox/checkbox.component';
@Component({
  selector: 'laji-select-collections-modal',
  templateUrl: './select-collections-modal.component.html',
  styleUrls: ['./select-collections-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectCollectionsModalComponent implements OnInit {
  @Input() included: string[] = [];
  @Input() excluded: string[] = [];
  @Input() collectionsTree$: Observable<ICollectionsTreeNode[]>;
  @Input() modalTitle: string;
  @Input() browseTitle: string;
  @Input() selectedTitle: string;
  @Input() okButtonLabel: string;
  @Input() clearButtonLabel: string;
  @ViewChild('tree') treeComponent: TreeComponent;
  @Output() emitConfirm = new EventEmitter<{
    collectionId: string[],
    collectionIdNot: string[]
  }>();

  selectedOptions: SelectedOption[] = [];
  treeModel: TreeModel;
  checkboxType = CheckboxType.excluded;

  filterDebounce = new Subject<string>();
  toHtmlInputElement = toHtmlInputElement;

  state: ITreeState;
  options: ITreeOptions = {
    useVirtualScroll: true,
    nodeHeight: 25,
    displayField: 'longName',
    idField: 'id',
    allowDrag: false,
    scrollOnActivate: false,
    nodeClass: (node: TreeNode) => {
      const selected = this.selectedOptions.find(option => option.id === node.id);
      let nodeClass;

      if (!!selected && selected.type === 'excluded') {
        nodeClass = 'tree-active-exclusion';
      } else if (!selected && node.isActive) {
        if (node.parent.getClass().includes('tree-active-exclusion')) {
          nodeClass = 'tree-active-exclusion tree-active-child';
        } else {
          nodeClass = 'tree-active-child';
        }
      }

      if (node.isActive && node.isFocused) {
        return nodeClass + ' tree-active-focused';
      }

      return nodeClass;
    },
    actionMapping: {
      mouse: {
        click: (tree: TreeModel, node: TreeNode, $event: any) => {
          this.nodeToggled(tree, node, $event);
        }
      },
      keys: {
        [KEYS.SPACE]: (tree: TreeModel, node: TreeNode, $event: any) => {
          this.nodeToggled(tree, node, $event);
        },
        [KEYS.ENTER]: (tree: TreeModel, node: TreeNode, $event: any) => {
          this.nodeToggled(tree, node, $event);
        }
      }
    }
  };

  ngOnInit() {}

  constructor(
    private modalRef: BsModalRef,
  ) {
    this.filterDebounce.pipe(
      debounceTime(500)
    ).subscribe(query => this.filterTree(query));
  }

  treeInit() {
    this.treeModel = this.treeComponent.treeModel;

    this.included.forEach(key => {
      const node = this.treeModel.getNodeById(key);

      this.initializeNode(this.treeModel, node, 'initalizing', 'included');
      this.expandParents(this.treeModel, node, null);
    });

    this.excluded.forEach(key => {
      const node = this.treeModel.getNodeById(key);

      this.initializeNode(this.treeModel, node, 'initalizing', 'excluded');
      this.expandParents(this.treeModel, node, null);
    });
  }

  onFilterChange(query) {
    this.filterDebounce.next(query);
  }

  filterTree(query) {
    if (query?.length > 0) {
      this.treeModel.filterNodes(query);
    } else {
      this.treeModel.clearFilter();
      this.treeModel.collapseAll();

      this.selectedOptions.forEach(option => {
        const node = this.treeModel.getNodeById(option.id);

        this.expandParents(this.treeModel, node, null);
      });
    }
  }

  expandParents(tree: TreeModel, node: TreeNode, $event: any) {
    if (node.parent) {
      this.expandParents(tree, node.parent, $event);
      TREE_ACTIONS.EXPAND(tree, node.parent, $event);
    }
  }

  initializeNode(tree: TreeModel, node: TreeNode, $event: any, type: 'included' | 'excluded') {
    this.nodeSelected(tree, node, $event);
    this.selectedOptions = this.selectedOptions.concat({
      id: node.id,
      value: node.displayField,
      type: type
    });
  }

  nodeToggled(tree: TreeModel, node: TreeNode, $event: any) {
    if ($event?.target.id === 'collectionLink') {
      return;
    }

    const selected = this.selectedOptions.find(option => option.id === node.id);

    if (node.isActive && node.parent.isActive) {
      if (selected) {
        this.removeNodeFromSelection(node);
      } else if (!node.getClass().includes('tree-active-exclusion')) {
        this.addNodeToSelection(node, 'excluded');
        this.clearChildSelections(node);
      }
    } else if (node.isActive && selected?.type === 'included') {
      this.switchNodeSelection(node);
      this.clearChildSelections(node);
    } else if (node.isActive && selected?.type === 'excluded') {
      this.nodeDeselected(tree, node, $event);
    } else if (!node.isActive) {
      this.addNodeToSelection(node);
      this.nodeSelected(tree, node, $event);
    }
  }

  addNodeToSelection(node: TreeNode, type: 'included' | 'excluded' = 'included') {
    this.selectedOptions = this.selectedOptions.concat({
      id: node.id,
      value: node.displayField,
      type: type
    });
  }

  switchNodeSelection(node: TreeNode) {
    this.selectedOptions = this.selectedOptions.map(option => {
      if (option.id === node.id) {
        return {
          ...option,
          type: 'excluded'
        };
      } else {
        return option;
      }
    });
  }

  removeNodeFromSelection(node: TreeNode) {
    this.selectedOptions = this.selectedOptions.filter(option => option.id !== node.id);
  }

  getCheckboxValue(id: string) {
    const selected = this.selectedOptions.find(option => option.id === id);

    if (!selected) {
      return undefined;
    }

    if (selected.type === 'included') {
      return true;
    } else if (selected.type === 'excluded') {
      return false;
    }
  }

  nodeSelected(tree: TreeModel, node: TreeNode, $event: any) {
    if ($event !== 'initalizing' || ($event === 'initalizing' && !node.isActive)) {
      TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event);
    }

    if (!node.hasChildren) {
      return;
    }

    node.children.forEach((child: TreeNode) => {
      if (child.isActive) {
        this.removeNodeFromSelection(child);
      } else {
        this.nodeSelected(tree, child, $event);
      }
    });

    node.focus();
  }

  nodeDeselected(tree: TreeModel, node: TreeNode, $event: any) {
    this.removeNodeFromSelection(node);

    TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event);

    if (!node.hasChildren) {
      return;
    }

    node.children.forEach(child => {
      this.nodeDeselected(tree, child, $event);
    });
  }

  clearChildSelections(node: TreeNode) {
    node.children.forEach(child => {
      this.removeNodeFromSelection(child);
      this.clearChildSelections(child);
    });
  }

  deselect(id: string) {
    const node = this.treeModel.getNodeById(id);

    this.removeNodeFromSelection(node);
    this.nodeDeselected(this.treeModel, node, null);
  }

  close() {
    this.modalRef.hide();
  }

  clear() {
    this.selectedOptions = [];
    this.treeModel.doForAll(node => {
      TREE_ACTIONS.DEACTIVATE(this.treeModel, node, null);
    });
    this.treeModel.collapseAll();
  }

  confirm() {
    this.modalRef.hide();
    const includeToReturn = [];
    const excludeToReturn = [];

    this.selectedOptions.forEach(option => {
      if (option.type === 'included') {
        includeToReturn.push(option.id);
      } else if (option.type === 'excluded') {
        excludeToReturn.push(option.id);
      }
    });


    this.emitConfirm.emit({
      collectionId: includeToReturn,
      collectionIdNot: excludeToReturn
    });
  }
}
