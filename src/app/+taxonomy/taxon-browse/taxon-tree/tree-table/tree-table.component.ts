import {
  Component, OnChanges, Input, Output, ChangeDetectorRef, EventEmitter, SimpleChanges
} from '@angular/core';
import { Observable, of, forkJoin , interval } from 'rxjs';
import { tap, map, switchMap, share, take } from 'rxjs/operators';
import { TreeNode } from './model/tree-node.interface';
import { TreeState } from './service/tree-state';
import { ObservationTableColumn } from '../../../../shared-modules/observation-result/model/observation-table-column';

@Component({
  selector: 'laji-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.css']
})
export class TreeTableComponent implements OnChanges {
  @Input() columns: ObservationTableColumn[];
  @Input() nodes: TreeNode[] = [];
  @Input() getChildren: (id: string) => Observable<any[]>;
  @Input() getParents: (id: string) => Observable<any[]>;

  @Input() skipParams: {key: string, values: string[], isWhiteList?: boolean}[];
  @Input() activeId: string;
  @Input() initialExpanderWidth = 200;

  rows = [];
  expanderColWidth: number;

  private treeState = new TreeState([]);
  private deepestLevel = 0;

  @Output() rowSelect = new EventEmitter<any>();

  constructor(
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nodes || changes.skipParams) {
      if (changes.nodes) {
        this.treeState = new TreeState(this.nodes, this.skipParams);
      } else {
        this.treeState.setSkipParams(this.skipParams);
        const missingChildren = this.treeState.update(this.nodes);

        for (let i = 0; i < missingChildren.length; i++) {
          this.toggleChildrenOpen(missingChildren[i], this.treeState);
        }
      }

      this.updateRows();
    }
  }

  toggle(node: TreeNode) {
    if (!node.hasChildren) {
      return;
    }

    if (this.treeState.state[node.id].isExpanded) {
      this.hideChildren(node, this.treeState);
      this.updateRows();
    } else {
      this.toggleChildrenOpen(node, this.treeState);
    }
  }

  toggleAll(node: TreeNode) {
    this.toggleAllChildrenOpen(node, this.treeState);
  }

  openTreeById(openId: string) {
    if (openId) {
      const nodes = this.nodes;
      const treeState = this.treeState;

      this.getParents(openId)
        .subscribe(res => {
          res.push({id: openId});
          this.toggleOpenChain(nodes, treeState, res);
        });
    }
  }

  getVisibleNodes(nodes = this.nodes) {
    const result = [];

    for (let i = 0; i < nodes.length; i++) {
      let children;
      if (this.treeState.state[nodes[i].id].isExpanded && nodes[i].children && !this.treeState.state[nodes[i].id].isLoading) {
        children = this.getVisibleNodes(nodes[i].children);
      }
      result.push({
        ...nodes[i],
        children: children
      });
    }

    return result;
  }

  refreshTable() {
    interval()
      .pipe(take(1))
      .subscribe(() => {
        if (this.rows) {
          this.rows = [...this.rows];
          this.cd.markForCheck();
        }
      });
  }

  private toggleAllChildrenOpen(node: TreeNode, treeState: TreeState) {
    this.setNodeOpen(node, treeState, true)
      .subscribe(() => {
        this.updateRows();
        this.cd.markForCheck();
      })
  }

  private toggleChildrenOpen(node: TreeNode, treeState: TreeState) {
    this.setNodeOpen(node, treeState)
      .subscribe(() => {
        this.updateRows();
        this.cd.markForCheck();
      })
  }

  private toggleOpenChain(nodes: TreeNode[], state: TreeState, chain: any[]) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === chain[0].id && nodes[i].hasChildren) {
        this.setNodeOpen(nodes[i], state)
          .subscribe(() => {
            this.updateRows();
            this.cd.markForCheck();
            this.toggleOpenChain(nodes[i].children, state, chain.slice(1));
          });
      }
    }
  }

  private setNodeOpen(node: TreeNode, treeState: TreeState, setChildrenOpen = false): Observable<TreeNode> {
    treeState.state[node.id].isExpanded = true;
    treeState.state[node.id].isLoading = true;

    return this.fetchChildren(node, treeState)
      .pipe(switchMap((children) => {
        const obs = [];
        for (let i = 0; i < children.length; i++) {
          if ((setChildrenOpen || treeState.state[children[i].id].isSkipped) && children[i].hasChildren) {
            obs.push(this.setNodeOpen(children[i], treeState, setChildrenOpen));
          }
        }

        return (obs.length > 0 ?  forkJoin(obs).pipe(map(() => (node))) : of(node))
          .pipe(tap(() => {
            treeState.state[node.id].isLoading = false;
          }))
      }))
  }

  private fetchChildren(node: TreeNode, treeState: TreeState): Observable<TreeNode[]> {
    if (node.children) {
      return of(node.children);
    } else if (treeState.pendingChildren[node.id]) {
      return treeState.pendingChildren[node.id];
    }

    treeState.pendingChildren[node.id] = this.getChildren(node.id)
      .pipe(
        tap(nodes => {
          for (let i = 0; i < nodes.length; i++) {
            treeState.updateNodeState(nodes[i], i, node.id);
          }
          node.children = nodes;
        }),
        share()
      );

    return treeState.pendingChildren[node.id];
  }

  private hideChildren(node: TreeNode, treeState: TreeState) {
    treeState.state[node.id].isExpanded = false;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.hideChildren(node.children[i], treeState);
      }
    }
  }

  private updateRows() {
    this.rows = [];
    this.deepestLevel = 0;

    this.update(this.nodes, this.treeState, this.rows);

    this.expanderColWidth = this.initialExpanderWidth + (10 * this.deepestLevel);
  }

  private update(nodes: TreeNode[], treeState: TreeState, rows: any[]) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeState = treeState.state[node.id];

      if (!nodeState.isSkipped) {
        rows.push({...node, node: node, state: nodeState});
        if (nodeState.level > this.deepestLevel) {
          this.deepestLevel = nodeState.level;
        }
      }

      if (nodeState.isExpanded && !nodeState.isLoading && node.children) {
        this.update(node.children, treeState, rows);
      }
    }
  }
}
