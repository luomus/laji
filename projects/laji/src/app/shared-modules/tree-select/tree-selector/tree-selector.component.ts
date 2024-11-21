import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ITreeOptions, ITreeState, KEYS, TreeComponent, TreeModel, TreeNode, TREE_ACTIONS } from '@ali-hm/angular-tree-component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { toHtmlInputElement } from '../../../shared/service/html-element.service';
import { CheckboxType } from '../../select/checkbox/checkbox.component';
import { SelectedOption, TreeOptionsNode } from '../tree-select.component';

@Component({
  selector: 'laji-tree-selector',
  templateUrl: './tree-selector.component.html',
  styleUrls: ['./tree-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectorComponent implements OnInit {
  @Input() selectedOptions: SelectedOption[] = [];
  @Input() optionsTree!: TreeOptionsNode[];
  @Input() multiselect = false;
  @Input() tristate = false;
  @Input() includeCheckbox = false;
  @Input() includeCount = false;
  @Input() includeLink = false;
  @Input() includeQualityIcon = false;
  @Input() openOnSelect = false;
  @Input() useVirtualScroll = true;
  @ViewChild('tree') treeComponent!: TreeComponent;
  @Output() emitSelect = new EventEmitter<SelectedOption[]>();

  treeModel!: TreeModel;
  checkboxType!: CheckboxType;
  filterDebounce$ = new Subject<string>();
  toHtmlInputElement = toHtmlInputElement;

  state?: ITreeState;
  options: ITreeOptions = {
    useVirtualScroll: true,
    nodeHeight: 25,
    displayField: 'name',
    idField: 'id',
    allowDrag: false,
    scrollOnActivate: false,
    nodeClass: (node: TreeNode): string => {
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

      return nodeClass as string;
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

  ngOnInit() {
    this.checkboxType = this.tristate ? CheckboxType.excluded : CheckboxType.basic;
    this.options.useVirtualScroll = this.useVirtualScroll;
  }

  constructor(
  ) {
    this.filterDebounce$.pipe(
      debounceTime(500)
    ).subscribe(query => this.filterTree(query));
  }

  treeInit() {
    this.treeModel = this.treeComponent.treeModel;

    this.selectedOptions.forEach(selected => {
      const node = this.treeModel.getNodeById(selected.id);

      this.nodeSelected(this.treeModel, node, 'initializing');
      this.expandParents(this.treeModel, node, null);
    });
  }

  onFilterChange(query: any) {
    this.filterDebounce$.next(query);
  }

  filterTree(query: any) {
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

  nodeToggled(tree: TreeModel, node: TreeNode, $event: any) {
    if ($event?.target.id === 'nodeLink') {
      return;
    }

    if (!this.multiselect) {
      if (this.tristate && node.isActive) {
        if (node.getClass().includes('tree-active-exclusion')) {
          this.removeNodeFromSelection(node);
          this.nodeDeselected(tree, node, $event);
        } else {
          this.replaceNodeSelection(node, 'excluded');
        }
      } else if (node.isActive) {
        this.removeNodeFromSelection(node);
        this.nodeDeselected(tree, node, $event);
      } else {
        this.replaceNodeSelection(node);
        this.nodeSelected(tree, node, $event);
      }

      return;
    }

    const selected = this.selectedOptions.find(option => option.id === node.id);

    if (node.isActive && node.parent.isActive) {
      if (selected) {
        this.removeNodeFromSelection(node);
      } else if (!node.getClass().includes('tree-active-exclusion') && this.tristate) {
        this.addNodeToSelection(node, 'excluded');
        this.clearChildSelections(node);
      }
    } else if (node.isActive && selected?.type === 'included') {
      if (this.tristate) {
        this.switchNodeSelection(node);
        this.clearChildSelections(node);
      } else {
        this.nodeDeselected(tree, node, $event);
      }
    } else if (this.tristate && node.isActive && selected?.type === 'excluded') {
      this.nodeDeselected(tree, node, $event);
    } else if (!node.isActive) {
      this.addNodeToSelection(node);
      this.nodeSelected(tree, node, $event);
    }
  }

  replaceNodeSelection(node: TreeNode, type: 'included' | 'excluded' = 'included') {
    this.selectedOptions = [{
      id: node.id,
      value: node.displayField,
      type
    }];

    this.emitSelect.emit(this.selectedOptions);
  }

  addNodeToSelection(node: TreeNode, type: 'included' | 'excluded' = 'included') {
    this.selectedOptions = this.selectedOptions.concat({
      id: node.id,
      value: node.displayField,
      type
    });

    this.emitSelect.emit(this.selectedOptions);
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

    this.emitSelect.emit(this.selectedOptions);
  }

  removeNodeFromSelection(node: TreeNode) {
    this.selectedOptions = this.selectedOptions.filter(option => option.id !== node.id);

    this.emitSelect.emit(this.selectedOptions);
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
    return undefined;
  }

  nodeSelected(tree: TreeModel, node: TreeNode, $event: any) {
    if ($event !== 'initalizing' || ($event === 'initalizing' && !node.isActive)) {
      this.multiselect ? TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event) : TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
    }

    if (this.openOnSelect) {
      node.expandAll();
    }

    if (!node.children || !this.multiselect) {
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

    if (this.openOnSelect) {
      node.collapseAll();
    }

    this.multiselect ? TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event) : TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);

    if (!node.children || !this.multiselect) {
      return;
    }

    node.children.forEach(child => {
      this.nodeDeselected(tree, child, $event);
    });
  }

  clearChildSelections(node: TreeNode) {
    node.children?.forEach(child => {
      this.removeNodeFromSelection(child);
      this.clearChildSelections(child);
    });
  }

  deselect(id: string) {
    const node = this.treeModel.getNodeById(id);

    this.removeNodeFromSelection(node);
    this.nodeDeselected(this.treeModel, node, null);
  }

  clear() {
    this.selectedOptions = [];
    this.treeModel.doForAll((node: TreeNode) => {
      TREE_ACTIONS.DEACTIVATE(this.treeModel, node, null);
    });
    this.treeModel.collapseAll();
    this.emitSelect.emit(this.selectedOptions);
  }
}
