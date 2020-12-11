import { Component, Input, OnInit, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ITreeOptions, ITreeState, KEYS, TreeComponent, TreeModel, TreeNode, TREE_ACTIONS } from '@circlon/angular-tree-component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SelectOption } from '../select-collections.component';

@Component({
  selector: 'laji-select-collections-modal',
  templateUrl: './select-collections-modal.component.html',
  styleUrls: ['./select-collections-modal.component.scss']
})

export class SelectCollectionsModalComponent implements OnInit {
  @Input() selected: string[] = [];
  @Input() collectionsTree$;
  @Input() modalTitle: string;
  @Input() browseTitle: string;
  @Input() selectedTitle: string;
  @Input() okButtonLabel: string;
  @Input() clearButtonLabel: string;
  @ViewChild('tree') treeComponent: TreeComponent;
  @Output() emitConfirm = new EventEmitter<string[]>();
  changeDetection: ChangeDetectionStrategy.OnPush;

  selectedOptions: SelectOption[] = [];
  treeModel: TreeModel;

  state: ITreeState;
  options: ITreeOptions = {
    useVirtualScroll: true,
    nodeHeight: 25,
    displayField: 'longName',
    idField: 'id',
    allowDrag: false,
    scrollOnActivate: false,
    nodeClass: (node: TreeNode) => {
      if (!this.isActiveParent(node) && node.isActive) {
        return 'tree-active-child';
      }
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
  ) {}

  treeInit($event: any) {
    this.treeModel = this.treeComponent.treeModel;

    this.selected?.forEach(key => {
      const node = this.treeModel.getNodeById(key);

      this.nodeToggled(this.treeModel, node, null);
      this.expandParents(this.treeModel, node, null);
    });
  }

  onFilterChange(query) {
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

  isActiveParent(node: TreeNode) {
    return node.isActive && this.selectedOptions.find(option => option.id === node.id);
  }

  expandParents(tree: TreeModel, node: TreeNode, $event: any) {
    if (node.parent) {
      this.expandParents(tree, node.parent, $event);
      TREE_ACTIONS.EXPAND(tree, node.parent, $event);
    }
  }

  nodeToggled(tree: TreeModel, node: TreeNode, $event: any) {
    if (this.isActiveParent(node)) {
      this.removeNodeFromSelection(node);
      this.nodeDeselected(tree, node, $event);
    } else if (!node.isActive) {
      this.addNodeToSelection(node);
      this.nodeSelected(tree, node, $event);
    }
  }

  addNodeToSelection(node: TreeNode) {
    this.selectedOptions = this.selectedOptions.concat({
      id: node.id,
      value: node.displayField
    });
  }

  removeNodeFromSelection(node: TreeNode) {
    this.selectedOptions = this.selectedOptions.filter(option => option.id !== node.id);
  }

  nodeSelected(tree: TreeModel, node: TreeNode, $event: any) {
    TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event);

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
  }

  nodeDeselected(tree: TreeModel, node: TreeNode, $event: any) {
    TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event);

    if (!node.hasChildren) {
      return;
    }

    node.children.forEach(child => {
      this.nodeDeselected(tree, child, $event);
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

  }

  confirm() {
    this.modalRef.hide();
    this.emitConfirm.emit(this.selectedOptions.map(option => option.id));
  }
}
