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

  nodeList: TreeNode[] = [];

  private rootId: string;

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

    if (changes.nodes || changes.activeId) {
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

    if (openId && this.nodes.length > 0) {
      if (!this.rootId) {
        this.loading = true;
      }
      const nodes = this.nodes;
      const treeState = this.treeState;

      const getParents: Observable<{id: string}[]> =
        treeState.state[openId] ? of(this.findParents(openId, nodes)) : this.getParents(openId);

      this.initialViewSubs = getParents
        .pipe(
          switchMap(parents => {
            parents.push({id: openId});
            return this.setView(nodes, treeState, parents)
              .pipe(
                map(nodeList => {
                  this.nodeList = nodeList;
                  this.rootId = nodeList[nodeList.length - 1].id;
                  this.loading = false;
                  this.cd.markForCheck();
                })
              );
          }))
        .subscribe();
    } else {
      this.nodeList = this.nodes;
      this.loading = false;
    }
  }

  findParents(id: string, nodes: TreeNode[], path = []): {id: string}[] {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.id === id) {
        return path;
      }
      if (node.children) {
        const newPath = [...path, {id: node.id}];
        const found = this.findParents(id, node.children, newPath);
        if (found) {
          return found;
        }
      }
    }
  }

  private toggleChildrenOpen(node: TreeNode, treeState: TreeState) {
    treeState.state[node.id].loadingCount++;

    this.setOpen(node, treeState).subscribe(() => {
      treeState.state[node.id].loadingCount--;
      this.cd.markForCheck();
    });
  }

  private setView(nodes: TreeNode[], treeState: TreeState, parentIds: any[], parentList = [], rootFound = false): Observable<TreeNode[]> {
    if (parentIds.length === 0) {
      return of(parentList);
    }

    let foundNode: TreeNode;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.id === parentIds[0].id) {
        foundNode = node;
      } else if (!rootFound) {
        this.hideChildren(node, treeState);
      }
    }

    if (!rootFound) {
      parentList.push(foundNode);
    }
    if (!foundNode.hasChildren) { return of(parentList); }
    if (foundNode.id === this.rootId) {
      rootFound = true;
    }

    if (parentIds.length === 1 && rootFound) {
      this.toggleChildrenOpen(foundNode, treeState);
      return of(parentList);
    }

    return this.setOpen(foundNode, treeState)
      .pipe(switchMap(() => {
        return this.setView(foundNode.children, treeState, parentIds.slice(1), parentList, rootFound);
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

          if (treeState.state[child.id].isSkipped) {
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
