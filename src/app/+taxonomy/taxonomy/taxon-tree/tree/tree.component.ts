import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ContentChild, TemplateRef } from '@angular/core';
import {forkJoin, Observable, of, Subscription} from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { TreeNode } from './model/tree-node.interface';
import { TreeState } from './service/tree-state';

@Component({
  selector: 'laji-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnChanges {
  @Input() nodes: TreeNode[] = [];
  @Input() getChildren: (id: string) => Observable<any[]>;
  @Input() getParents: (id: string) => Observable<any[]>;

  @Input() skipParams: {key: string, values: string[], isWhiteList?: boolean}[];
  @Input() activeId: string;

  @ContentChild('label') labelTpl: TemplateRef<any>;

  treeState = new TreeState([]);

  initialViewSubs: Subscription;
  loading = true;

  constructor(
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nodes) {
      this.treeState = new TreeState(this.nodes, this.skipParams);
    } else if (changes.skipParams) {
      const missingChildren = this.treeState.setSkipParams(this.nodes, this.skipParams);
      for (let i = 0; i < missingChildren.length; i++) {
        this.toggleChildrenOpen(missingChildren[i], this.treeState);
      }
    }

    if ((changes.nodes || changes.activeId) && this.nodes.length > 0) {
      this.setInitialView(this.activeId);
    }
  }

  toggle(node: TreeNode) {
    if (!node.hasChildren) {
      return;
    }

    if (this.treeState.state[node.id].isExpanded) {
      this.hideChildren(node, this.treeState);
    } else {
      this.toggleChildrenOpen(node, this.treeState);
    }
  }

  setInitialView(openId: string) {
    if (this.initialViewSubs) {
      this.initialViewSubs.unsubscribe();
    }
    this.loading = true;
    this.hideChildren(this.nodes[0], this.treeState);

    if (openId) {
      const nodes = this.nodes;
      const treeState = this.treeState;

      this.initialViewSubs = this.getParents(openId)
        .pipe(
          switchMap(res => {
            res.push({id: openId});
            return this.setChainOpen(nodes, treeState, res)
              .pipe(
                map((hideParams: any) => {
                  treeState.setHideParams(nodes, hideParams);
                  this.loading = false;
                  this.cd.markForCheck();
                })
              );
          }))
        .subscribe();
    } else {
      this.loading = false;
    }
  }


  private toggleChildrenOpen(node: TreeNode, treeState: TreeState) {
    treeState.state[node.id].loadingCount++;

    this.setOpen(node, treeState).subscribe(() => {
      treeState.state[node.id].loadingCount--;
      this.cd.markForCheck();
    });
  }

  private setChainOpen(nodes: TreeNode[], treeState: TreeState, chain: any[], hideParams = [{key: 'id', values: []}]): Observable<any> {
    if (chain.length === 0) { return of(hideParams); }

    let foundNode: TreeNode;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.id === chain[0].id) {
        foundNode = node;
      } else {
        hideParams[0].values.push(node.id);
      }
    }

    if (!foundNode.hasChildren) { return of(hideParams); }

    return this.setOpen(foundNode, treeState)
      .pipe(switchMap(() => {
        return this.setChainOpen(foundNode.children, treeState, chain.slice(1), hideParams);
      }));
  }

  private setOpen(node: TreeNode, treeState: TreeState): Observable<TreeNode> {
    treeState.state[node.id].isExpanded = true;

    return this.fetchChildren(node, treeState)
      .pipe(switchMap((children) => {
        const obs = [];
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child.hasChildren) { continue; }

          if (treeState.state[child.id].isSkipped && !treeState.state[child.id].isHidden) {
            obs.push(this.setOpen(child, treeState));
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
}
