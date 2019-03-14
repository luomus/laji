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

  private activeId: string;
  private rootId: string;

  constructor(
    getData: (id: string) => Observable<any>,
    getChildren: (id: string) => Observable<any[]>,
    getParents: (id: string) => Observable<any[]>
  ) {
    this.getData = getData;
    this.getChildren = getChildren;
    this.getParents = getParents;
  }

  setView(activeId: string, skipParams: TreeSkipParameter[]): Observable<boolean> {
    if (skipParams !== this.skipParams) {
      this.skipParams = skipParams;
      this.parentNodeList = [];
    }

    this.activeId = activeId;
    this.loadingParentNodeList = true;

    return forkJoin([
      this.getData(activeId),
      this.getParents(activeId)
    ])
      .pipe(
        switchMap(data => {
          const parentList = data[1];
          parentList.push(data[0]);

          return this.updateNodes(parentList);
        })
      );
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

  private updateNodes(parentList: any[]): Observable<boolean> {
    const oldParentNodeList = this.parentNodeList;
    const newParentNodeList = [];
    let lastParent: TreeNode;

    for (let i = 0; i < parentList.length; i++) {
      const parent = parentList[i];
      const isRoot = (parent.id === this.rootId || i === parentList.length - 1);

      let node;
      if (isRoot && oldParentNodeList.length > i && oldParentNodeList[i].value.id === parent.id) {
        node = oldParentNodeList[i];
      } else {
        node = {
          value: parent,
          state: TreeStateService.getInitialState(parent, this.skipParams, lastParent)
        };
      }

      newParentNodeList.push(node);
      lastParent = node;

      if (isRoot) {
        break;
      }
    }

    while (lastParent.state.isSkipped && lastParent.value.id !== this.activeId) {
      newParentNodeList.pop();
      lastParent = newParentNodeList[newParentNodeList.length - 1];
    }

    const childIds = [];
    for (let i = newParentNodeList.length; i < parentList.length; i++) {
      childIds.push(parentList[i].id);
    }

    this.parentNodeList = newParentNodeList;
    this.rootId = lastParent.value.id;
    this.loadingParentNodeList = false;

    return this.openNodes(lastParent, childIds);
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

          if (child.state.isSkipped && child.value.id !== this.activeId) {
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
