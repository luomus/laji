import {
  Component, OnChanges, Input, Output, ViewChild, TemplateRef, ChangeDetectorRef, ContentChild,
  EventEmitter, SimpleChanges
} from '@angular/core';
import { Observable, of, forkJoin, Subscription } from 'rxjs';
import { tap, map, switchMap, share } from 'rxjs/operators';
import { DatatableTemplatesComponent } from '../../../../shared-modules/datatable/datatable-templates/datatable-templates.component';
import { TreeNode, TreeNodeState } from './tree-node.interface';
import { CacheService } from '../../../../shared/service/cache.service';

const CACHE_COLUMN_SETINGS = 'tree-table-col-width';
interface Settings {[key: string]: {width: string}}

@Component({
  selector: 'laji-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.css']
})
export class TreeTableComponent implements OnChanges {
  private static settings: Settings;

  @Input() nodes: TreeNode[] = [];
  @Input() getChildren: (id: string) => Observable<any[]>;
  @Input() getParents: (id: string) => Observable<any[]>;
  @Input() skipParams: {key: string, values: string[], isWhiteList?: boolean}[];

  rows = [];
  _columns = [];

  private nodeStates: {[key: string]: TreeNodeState} = {};
  private pendingChildren: {[key: string]: Observable<TreeNode[]>} = {};
  private subs: Subscription[] = [];
  private missingChildren: TreeNode[] = [];

  private activeId: string;
  private deepestLevel = 0;

  @ViewChild('expander') expanderTpl: TemplateRef<any>;
  @ContentChild('expanderLabel') expanderLabel: TemplateRef<any>;
  @ViewChild('datatableTemplates') datatableTemplates: DatatableTemplatesComponent;

  rowClass = this._rowClass();
  @Output() rowSelect = new EventEmitter<any>();

  @Input() set columns(columns: any) {
    const settings$ = TreeTableComponent.settings ?
      of(TreeTableComponent.settings) :
      this.cacheService.getItem<Settings>(CACHE_COLUMN_SETINGS)
        .pipe(
          map(value => value || {}),
          tap(value => TreeTableComponent.settings = value)
        );

    settings$.subscribe(settings => {
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
        if (settings && settings[column.name] && settings[column.name].width) {
          column.width = settings[column.name].width;
        }
        column.sortable = false;
        this._columns.push(column);
      });

      this.cd.markForCheck();
    });
  }

  constructor(
    private cacheService: CacheService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nodes || changes.skipParams) {
      if (changes.nodes) {
        this.subs.map((sub) => {
          sub.unsubscribe();
        });
        this.subs = [];
        this.nodeStates = {};
        this.pendingChildren = {};
      }

      this.missingChildren = [];
      this.updateNodeStates(this.nodes);
      for (let i = 0; i < this.missingChildren.length; i++) {
        this.toggleChildrenOpen(this.missingChildren[i]);
      }

      this.updateRows();
    }
  }

  openTreeById(openId: string) {
    this.activeId = openId;
    this.rowClass = this._rowClass(openId);

    if (openId) {
      this.subs.push(this.getParents(openId)
        .subscribe(res => {
          res.push({id: openId});
          this.toggleOpenChain(this.nodes, res);
        })
      );
    }
  }

  private updateNodeStates(nodes: TreeNode[], parentState?: TreeNodeState, virtualParent?: TreeNode) {
    for (let i = 0; i < nodes.length; i++) {
      const state = this.updateNodeState(nodes[i], i, parentState);

      if (nodes[i].children) {
        this.updateNodeStates(nodes[i].children, state, state.isSkipped ? virtualParent : nodes[i]);
      } else if (state.isExpanded && this.missingChildren.indexOf(virtualParent) === -1) {
        this.missingChildren.push(virtualParent);
      }
    }
  }

  private updateNodeState(node: TreeNode, childNbr, parentState?: TreeNodeState): TreeNodeState {
    const skipped = this.getSkipped(node);
    const expanded = this.nodeStates[node.id] ? this.nodeStates[node.id].isExpanded : false;

    this.nodeStates[node.id] = {
      level: !parentState ? 0 : (parentState.isSkipped ? parentState.level : parentState.level + 1),
      isFirstChild: childNbr === 0 && (!parentState || !parentState.isSkipped || parentState.isFirstChild),
      isExpanded: skipped && parentState.isExpanded ? true : expanded,
      isSkipped: skipped,
      isLoading: false
    };

    return this.nodeStates[node.id];
  }

  private getSkipped(node: TreeNode): boolean {
    if (this.skipParams && this.skipParams.length > 0) {
      for (let i = 0; i < this.skipParams.length; i++) {
        const key = this.skipParams[i].key;
        const values = this.skipParams[i].values;
        const isWhiteList = this.skipParams[i].isWhiteList;

        for (let j = 0; j < values.length; j++) {
          if (node[key] === values[j]) {
            return !isWhiteList;
          }
        }

        if (isWhiteList) {
          return true;
        }
      }
    }
    return false;
  }

  toggle(node: TreeNode) {
    if (!node.hasChildren) {
      return;
    }

    if (this.nodeStates[node.id].isExpanded) {
      this.hideChildren(node);
      this.updateRows();
    } else {
      this.toggleChildrenOpen(node);
    }
  }

  private toggleChildrenOpen(node: TreeNode) {
    this.subs.push(
      this.setNodeOpen(node)
        .subscribe(() => {
          this.updateRows();
          this.cd.markForCheck();
        })
    );
  }

  private setNodeOpen(node: TreeNode): Observable<TreeNode> {
    const nodeState = this.nodeStates[node.id];
    nodeState.isExpanded = true;
    nodeState.isLoading = true;

    return this.fetchChildren(node)
      .pipe(switchMap((children) => {
        const obs = [];
        for (let i = 0; i < children.length; i++) {
          if (this.nodeStates[children[i].id].isSkipped) {
            obs.push(this.setNodeOpen(children[i]));
          }
        }

        return (obs.length > 0 ?  forkJoin(obs).pipe(map(() => (node))) : of(node))
          .pipe(tap(() => {
            nodeState.isLoading = false;
          }))
      }))
  }

  private fetchChildren(node: TreeNode): Observable<TreeNode[]> {
    if (node.children) {
      return of(node.children);
    } else if (this.pendingChildren[node.id]) {
      return this.pendingChildren[node.id];
    }

    this.pendingChildren[node.id] = this.getChildren(node.id)
      .pipe(
        tap(nodes => {
          for (let i = 0; i < nodes.length; i++) {
            this.updateNodeState(nodes[i], i, this.nodeStates[node.id]);
          }
          node.children = nodes;
        }),
        share()
      );

    return this.pendingChildren[node.id];
  }

  private hideChildren(node: TreeNode) {
    this.nodeStates[node.id].isExpanded = false;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.hideChildren(node.children[i]);
      }
    }
  }

  private updateRows() {
    this.rows = [];
    this.deepestLevel = 0;

    this.update(this.nodes, this.rows);

    if (this._columns.length > 0) {
      this._columns[0].width = 200 + (10 * this.deepestLevel);
      this._columns = [...this._columns];
    }
  }

  private update(nodes: TreeNode[], rows: any[]) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeState = this.nodeStates[node.id];

      if (!nodeState.isSkipped) {
        rows.push({...node, node: {data: node, state: nodeState}});
        if (nodeState.level > this.deepestLevel) {
          this.deepestLevel = nodeState.level;
        }
      }

      if (nodeState.isExpanded && !nodeState.isLoading && node.children) {
        this.update(node.children, rows);
      }
    }
  }

  onRowSelect(event) {
    if (event.type !== 'click' || event.type === 'dblClick') {
      return;
    }

    if (event.column.prop === 'node') {
      this.toggle(event.row.node.data);
    } else {
      this.rowSelect.emit(event);
    }
  }

  private _rowClass(activeId?: string) {
    return (row) => {
      if (row.id === activeId) {
        return 'active link';
      }
      return 'link';
    }
  }

  private toggleOpenChain(nodes: TreeNode[], chain: any[]) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === chain[0].id && nodes[i].hasChildren) {
        this.subs.push(this.setNodeOpen(nodes[i])
          .subscribe(() => {
            this.updateRows();
            this.cd.markForCheck();
            this.toggleOpenChain(nodes[i].children, chain.slice(1));
          })
        );
      }
    }
  }

  onResize(event) {
    if (event && event.column && event.column.name && event.newValue) {
      TreeTableComponent.settings[event.column.name] = {width: event.newValue};
      this.cacheService.setItem<Settings>(CACHE_COLUMN_SETINGS, TreeTableComponent.settings)
        .subscribe(() => {}, () => {});
    }
  }
}
