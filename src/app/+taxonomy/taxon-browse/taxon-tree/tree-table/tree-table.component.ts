import {
  Component, OnChanges, Input, Output, ViewChild, TemplateRef, ChangeDetectorRef, ContentChild,
  EventEmitter
} from '@angular/core';
import { Observable } from 'rxjs';
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

  loading = {};

  rows = [];
  _columns = [];

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

  ngOnChanges() {
    this.updateRowsAndNodes();
  }

  toggle(node: TreeNode) {
    node.isExpanded = !node.isExpanded;
    if (!node.isExpanded) {
      this.hideChildren(node.children);
    }

    if (node.isExpanded && node.hasChildren && !node.children) {
      this.loading[node.id] = true;

      this.getChildren(node.id)
        .subscribe((children) => {
          node.children = children;

          this.updateRowsAndNodes();
          this.loading[node.id] = false;
          this.cd.markForCheck();
        });
    } else {
      this.updateRowsAndNodes();
    }
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

  private updateRowsAndNodes() {
    this.rows = [];
    if (this.nodes.length > 0) {
      this.nodes[0].isRoot = true;
    }
    this.update(this.nodes, this.rows, 0);
  }

  private update(nodes: TreeNode[], rows: any[], level: number) {
    for (let i = 0; i < nodes.length; i++) {
      if (i === 0) {
        nodes[i].isFirstChild = true;
      }
      nodes[i].level = level;

      rows.push({...nodes[i], node: nodes[i]});

      if (nodes[i].isExpanded) {
        this.update(nodes[i].children, rows, level + 1);
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
}
