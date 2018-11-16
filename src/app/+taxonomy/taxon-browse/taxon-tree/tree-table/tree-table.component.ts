import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { forkJoin, interval, Observable, of } from 'rxjs';
import { map, share, switchMap, take, tap } from 'rxjs/operators';
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
  @Input() hideParams: {key: string, values: string[], isWhiteList?: boolean}[];
  @Input() activeId: string;
  @Input() initialExpanderWidth = 200;

  rows = [];
  expanderColWidth: number;

  private treeState = new TreeState([]);
  private deepestLevel = 0;

  constructor(
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nodes || changes.skipParams || changes.hideParams) {
      if (changes.nodes) {
        this.treeState = new TreeState(this.nodes, this.skipParams, this.hideParams);
      } else {
        this.treeState.setSkipParams(this.skipParams);
        this.treeState.setHideParams(this.hideParams);

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
      if (this.treeState.state[nodes[i].id].isExpanded && nodes[i].children && this.treeState.state[nodes[i].id].loadingCount === 0) {
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

  private toggleOpenChain(nodes: TreeNode[], treeState: TreeState, chain: any[]) {
    this.setChainOpen(nodes, treeState, chain)
      .subscribe(() => {
        this.updateRows();
        this.cd.markForCheck();
      });
  }

  private setNodeOpen(node: TreeNode, treeState: TreeState, setAllChildrenOpen?): Observable<TreeNode> {
    treeState.state[node.id].loadingCount++;

    return this.setOpen(node, treeState, setAllChildrenOpen).pipe(tap(() => {
      treeState.state[node.id].loadingCount--;
    }))
  }

  private setChainOpen(nodes: TreeNode[], treeState: TreeState, chain: any[]): Observable<TreeNode> {
    if (chain.length === 0) {
      return of(undefined);
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.hasChildren) { continue; }

      if (node.id === chain[0].id) {
        chain = chain.slice(1);

        if (node.children && treeState.state[node.id].isExpanded && treeState.state[node.id].loadingCount === 0) {
          return this.setChainOpen(node.children, treeState, chain)
            .pipe(map(() => (node)));
        } else {
          treeState.state[node.id].loadingCount++;

          return this.setOpen(node, treeState)
            .pipe(switchMap(() => {
              return this.setChainOpen(node.children, treeState, chain)
                .pipe(
                  map(() => (node)),
                  tap(() => {
                    treeState.state[node.id].loadingCount--;
                  })
                )
            }));
        }
      }
    }
  }

  private setOpen(node: TreeNode, treeState: TreeState, setAllChildrenOpen?) {
    treeState.state[node.id].isExpanded = true;

    return this.fetchChildren(node, treeState)
      .pipe(switchMap((children) => {
        const obs = [];
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child.hasChildren) { continue; }

          if (setAllChildrenOpen || treeState.state[child.id].isSkipped) {
            obs.push(this.setOpen(child, treeState, setAllChildrenOpen));
          }
        }

        return (obs.length > 0 ?  forkJoin(obs).pipe(map(() => (node))) : of(node));
      }));
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
          this.treeState.updateNodeStates(nodes, node.id);
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

      if (!(nodeState.isSkipped || nodeState.isHidden)) {
        rows.push({...node, node: node, state: nodeState});
        if (nodeState.level > this.deepestLevel) {
          this.deepestLevel = nodeState.level;
        }
      }

      if (nodeState.isExpanded && nodeState.loadingCount === 0 && node.children && !nodeState.isHidden) {
        this.update(node.children, treeState, rows);
      }
    }
  }
}
