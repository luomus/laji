import {
  Component, OnChanges, Input, Output, ViewChild, TemplateRef, ChangeDetectorRef, ContentChild,
  EventEmitter, SimpleChanges
} from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { DatatableTemplatesComponent } from '../../../../shared-modules/datatable/datatable-templates/datatable-templates.component';
import { TreeNode } from './tree-node.interface';

@Component({
  selector: 'laji-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.css']
})
export class TreeTableComponent implements OnChanges {
  @Input() nodes: TreeNode[] = [];
  @Input() getChildren: (id: string) => Observable<any[]>;
  @Input() getParents: (id: string) => Observable<any[]>;
  @Input() skipParams: {key: string, values: string[]}[];

  rows = [];
  _columns = [];

  private missingChildren = [];

  @ViewChild('expander') expanderTpl: TemplateRef<any>;
  @ContentChild('expanderLabel') expanderLabel: TemplateRef<any>;
  @ViewChild('datatableTemplates') datatableTemplates: DatatableTemplatesComponent;

  @Output() rowSelect = new EventEmitter<any>();

  @Input() set columns(columns: any) {
    this._columns = [{
      prop: 'node',
      name: '',
      cellTemplate: this.expanderTpl,
      frozenLeft: true,
      width: 165
    }];

    columns.map(column => {
      if (!column.headerTemplate) {
        column.headerTemplate = this.datatableTemplates.header;
      }
      if (typeof column.cellTemplate === 'string') {
        column.cellTemplate = this.datatableTemplates[column.cellTemplate];
      }
      column.sortable = false;
      this._columns.push(column);
    });
  }

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nodes || changes.skipParams) {
      this.missingChildren = [];
      this.nodes = this.getUpdatedNodes(this.nodes);
      this.updateRows();
      for (let i = 0; i < this.missingChildren.length; i++) {
        this.toggleChildrenOpen(this.missingChildren[i]);
      }
    }
  }

  openTreeById(openId: string) {
    this.getParents(openId)
      .subscribe(res => {
        res.push({id: openId});
        this.toggleOpenChain(this.nodes, res);
      });
  }

  private getUpdatedNodes(nodes: any, parent?: TreeNode, virtualParent?: TreeNode): TreeNode[] {
    const result = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      result.push(this.getChildNode(node, i, parent));

      if (node.children) {
        result[i].children = this.getUpdatedNodes(node.children, result[i], result[i].isSkipped ? parent : result[i]);
      } else if (node.isExpanded && this.missingChildren.indexOf(virtualParent) === -1) {
        this.missingChildren.push(virtualParent);
      }
    }

    return result;
  }

  private getChildNode(data: any, childNbr, parent?: TreeNode): TreeNode {
    const skipped = this.getSkipped(data);

    return {
      ...data,
      id: data.id,
      hasChildren: data.hasChildren,
      level: !parent ? 0 : (parent.isSkipped ? parent.level : parent.level + 1),
      isFirstChild: childNbr === 0 && (!parent || !parent.isSkipped || parent.isFirstChild),
      isExpanded: skipped && parent.isExpanded ? true : data.isExpanded,
      isSkipped: skipped
    }
  }

  private getSkipped(node: any): boolean {
    if (this.skipParams && this.skipParams.length > 0) {
      for (let i = 0; i < this.skipParams.length; i++) {
        const key = this.skipParams[i].key;
        const values = this.skipParams[i].values;
        for (let j = 0; j < values.length; j++) {
          if (node[key] === values[j]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  toggle(node: TreeNode) {
    if (!node.hasChildren) {
      return;
    }
    node.isExpanded = !node.isExpanded;
    if (!node.isExpanded) {
      this.hideChildren(node.children);
    } else {
      this.expandSkippedChildren(node.children);
    }

    if (node.isExpanded && node.hasChildren && !node.children) {
      this.toggleChildrenOpen(node);
    } else {
      this.updateRows();
    }
  }

  private toggleChildrenOpen(node: TreeNode) {
    node.isLoading = true;

    this.updateChildren(node)
      .subscribe(() => {
        this.updateRows();
        node.isLoading = false;
        this.cd.markForCheck();
      });
  }

  private updateChildren(node: TreeNode): Observable<any> {
    return this.fetchChildren(node)
      .pipe(
        switchMap((children) => {
          const obs = [];
          for (let i = 0; i < children.length; i++) {
            if (children[i].isSkipped) {
              obs.push(this.fetchChildren(children[i]));
            }
          }

          return (obs.length > 0 ? forkJoin(obs) : of(children));
        })
      );
  }

  private fetchChildren(node: TreeNode): Observable<TreeNode[]> {
    if (node.children) {
      return of(node.children);
    }
    return this.getChildren(node.id)
      .pipe(
        map(children => {
          const nodes = [];
          for (let i = 0; i < children.length; i++) {
            nodes.push(this.getChildNode(children[i], i, node));
          }
          return nodes;
        }),
        tap(nodes => {
          node.children = nodes;
        })
      );
  }

  private hideChildren(nodes: TreeNode[]) {
    if (!nodes) {
      return;
    }

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].isExpanded) {
        nodes[i].isExpanded = false;
        this.hideChildren(nodes[i].children);
      }
    }
  }

  private expandSkippedChildren(nodes: TreeNode[]) {
    if (!nodes) {
      return;
    }

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].isSkipped) {
        nodes[i].isExpanded = true;
        this.expandSkippedChildren(nodes[i].children);
      }
    }
  }

  private updateRows() {
    this.rows = [];
    this.update(this.nodes, this.rows);
  }

  private update(nodes: TreeNode[], rows: any[]) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (!nodes[i].isSkipped) {
        rows.push({...node, node: node});
      }

      if (node.isExpanded && node.children) {
        this.update(node.children, rows);
      }
    }
  }

  onRowSelect(event) {
    if (event.type !== 'click' || event.type === 'dblClick') {
      return;
    }

    if (event.column.prop === 'node') {
      this.toggle(event.row.node);
    } else {
      this.rowSelect.emit(event);
    }
  }

  rowClass() {
    return 'link';
  }

  private toggleOpenChain(nodes: TreeNode[], chain: any[]) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === chain[0].id && nodes[i].hasChildren) {
        nodes[i].isLoading = true;
        this.updateChildren(nodes[i])
          .subscribe(() => {
            nodes[i].isExpanded = true;
            nodes[i].isLoading = false;
            this.updateRows();
            this.cd.markForCheck();
            this.toggleOpenChain(nodes[i].children, chain.slice(1));
          });
      }
    }
  }
}
