import { Component, OnChanges, Input, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { DatatableTemplatesComponent } from '../../../../shared-modules/datatable/datatable-templates/datatable-templates.component';

@Component({
  selector: 'laji-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.css']
})
export class TreeTableComponent implements OnChanges {
  @Input() nodes = [];
  @Input() expanderVariable: string;
  @Input() getChildren: (id: string) => Observable<any[]>;

  loading = {};

  rows = [];
  _columns = [];

  @ViewChild('expander') expanderTpl: TemplateRef<any>;
  @ViewChild('datatableTemplates') datatableTemplates: DatatableTemplatesComponent;

  @Input() set columns(columns: any) {
    this._columns = this.datatableTemplates.getColumns(columns);
    this._columns.unshift({
        prop: 'node',
        name: '',
        cellTemplate: this.expanderTpl
    });
  }

  constructor(
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnChanges() {
    this.setRowsFromNodes();
  }

  toggle(node: any) {
    node.isExpanded = !node.isExpanded;
    if (!node.isExpanded) {
      this.hideChildren(node.children);
    }

    if (node.isExpanded && node.hasChildren && !node.children) {
      this.loading[node.id] = true;

      this.getChildren(node.id)
        .subscribe((children) => {
          node.children = children;

          this.setRowsFromNodes();
          this.loading[node.id] = false;
          this.cd.markForCheck();
        });
    } else {
      this.setRowsFromNodes();
    }
  }

  private hideChildren(nodes) {
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

  private setRowsFromNodes() {
    this.rows = [];
    if (this.nodes.length > 0) {
      this.nodes[0].isRoot = true;
    }
    this.rowsFromNodes(this.nodes, this.rows, 0);
  }

  private rowsFromNodes(nodes, rows, level) {
    for (let i = 0; i < nodes.length; i++) {
      if (i === 0) {
        nodes[i].isFirstChild = true;
      }
      nodes[i].level = level;

      rows.push({...nodes[i], node: nodes[i]});

      if (nodes[i].isExpanded) {
        this.rowsFromNodes(nodes[i].children, rows, level + 1);
      }
    }
  }
}
