import { TreeNode, TreeSkipParameter } from '../model/tree.interface';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TreeStateService } from './tree-state.service';

export class Tree {
  parentNodeList: TreeNode[] = [];
  loadingParentNodeList = false;

  private getData: (id: string) => Observable<any>;
  private getChildren: (id: string) => Observable<any[]>;
  private getParents: (id: string) => Observable<any[]>;
  private skipParams: {key: string, values: string[], isWhiteList?: boolean}[];

  private rootId: string;

  constructor(
    getData: (id: string) => Observable<any>,
    getChildren: (id: string) => Observable<any[]>,
    getParents: (id: string) => Observable<any[]>,
    skipParams: TreeSkipParameter[]
  ) {
    this.getData = getData;
    this.getChildren = getChildren;
    this.getParents = getParents;
    this.skipParams = skipParams;
  }

  setView(activeId: string): Observable<boolean> {
    this.loadingParentNodeList = true;

    return forkJoin([
      this.getData(activeId),
      this.getParents(activeId)
    ])
      .pipe(
        switchMap(data => {
          const parentList = data[1];
          parentList.push(data[0]);

          this.updateRootId(parentList);
          return this.updateNodes(parentList);
        })
      );
  }

  setSkipParams(skipParams: TreeSkipParameter[]): Observable<boolean> {
    this.skipParams = skipParams;
    const nodesMissingChildren = TreeStateService.updateAllStates(this.parentNodeList, this.skipParams);

    if (nodesMissingChildren.length === 0) {
      return of(true);
    }

    return forkJoin(nodesMissingChildren.map(node => this.openNode(node)))
      .pipe(map((returnValues) => returnValues.every(Boolean)));
  }

  openNode(node: TreeNode): Observable<boolean> {
    node.state.loadingCount++;

    return this.setOpen(node).pipe(
      map(() => {
        node.state.loadingCount--;
        return true;
      }));
  }

  hideNode(node: TreeNode) {
    node.state.isExpanded = false;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.hideNode(node.children[i]);
      }
    }
  }

  private updateRootId(parentList: any[]): string {
    for (let i = 0; i < parentList.length; i++) {
      if (parentList[i].id === this.rootId) {
        return;
      }
    }
    this.rootId = parentList[parentList.length - 1].id;
  }

  private updateNodes(parentList: any[]): Observable<boolean> {
    const oldParentNodeList = this.parentNodeList;
    const newParentNodeList = [];
    const childIds = [];

    let rootFound = false;
    let prevParent: TreeNode;

    parentList.forEach((parent, idx) => {
      const isRoot = parent.id === this.rootId;

      if (!rootFound) {
        let node: TreeNode;

        if (isRoot && oldParentNodeList.length > idx && oldParentNodeList[idx].value.id === parent.id) {
          node = oldParentNodeList[idx];
        } else {
          node = {
            value: parent,
            state: TreeStateService.getInitialState(parent, this.skipParams, prevParent)
          };
        }

        newParentNodeList.push(node);
      } else {
        childIds.push(parent.id);
      }

      if (isRoot) {
        rootFound = true;
      }
      prevParent = parent;
    });

    this.parentNodeList = newParentNodeList;
    this.loadingParentNodeList = false;

    return this.openNodes(this.parentNodeList[this.parentNodeList.length - 1], childIds);
  }

  private openNodes(node: TreeNode, childIds: string[]): Observable<boolean> {
    return this.openNode(node)
      .pipe(switchMap(() => {
        let foundNode: TreeNode;
        if (childIds.length > 0) {
          for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].value.id === childIds[0]) {
              foundNode = node.children[i];
            }
          }
        }

        return foundNode ? this.openNodes(foundNode, childIds.slice(1)) : (childIds.length === 1 ? of(true) : of(false));
      }));
  }

  private setOpen(node: TreeNode): Observable<TreeNode> {
    node.state.isExpanded = true;

    return this.fetchChildren(node)
      .pipe(switchMap((children: TreeNode[]) => {
        const obs = [];
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child.value.hasChildren) { continue; }

          if (child.state.isSkipped) {
            obs.push(this.setOpen(child));
          }
        }

        return (obs.length > 0 ?  forkJoin(obs).pipe(map(() => (node))) : of(node));
      }));
  }

  private fetchChildren(node: TreeNode): Observable<TreeNode[]> {
    if (node.children) {
      return of(node.children);
    }

    return this.getChildren(node.value.id)
      .pipe(
        map(children => {
          const nodes = children.map(child => ({
            value: child,
            state: TreeStateService.getInitialState(child, this.skipParams, node)
          }));

          node.children = nodes;
          return nodes;
        })
      );
  }
}
