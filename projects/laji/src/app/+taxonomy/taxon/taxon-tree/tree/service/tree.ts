import { TreeNode, TreeSkipParameter } from '../model/tree.interface';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TreeStateService } from './tree-state.service';

export class Tree {
  parentNodeList: TreeNode[] = [];
  loadingParentNodeList = false;

  private getData: (id: string) => Observable<any>;
  private getChildren: (id: string) => Observable<any[]>;
  private getParents: (id: string) => Observable<any[]>;

  private skipParams: {key: string; values: string[] | boolean[]; isWhiteList?: boolean}[] | undefined;

  private activeId: string | undefined;
  private rootId: string | undefined;

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
          const parentList = [...data[1]];
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
      for (const child of node.children) {
        this.hideNode(child);
      }
    }
  }

  private updateNodes(parentList: any[]): Observable<boolean> {
    const oldParentNodeList = this.parentNodeList;
    const newParentNodeList = [];
    let lastParent: TreeNode | undefined;

    for (let i = 0; i < parentList.length; i++) {
      const parent = parentList[i];
      const isRoot = (parent.id === this.rootId || i === parentList.length - 1);

      let node;
      if (isRoot && oldParentNodeList.length > i && oldParentNodeList[i].value.id === parent.id) {
        node = oldParentNodeList[i];
      } else {
        node = {
          value: parent,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          state: TreeStateService.getInitialState(parent, this.skipParams!, lastParent)
        };
      }

      newParentNodeList.push(node);
      lastParent = node;

      if (isRoot) {
        break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    while (lastParent!.state.isSkipped && lastParent!.value.id !== this.activeId) {
      newParentNodeList.pop();
      lastParent = newParentNodeList[newParentNodeList.length - 1];
    }

    const childIds = [];
    for (let i = newParentNodeList.length; i < parentList.length; i++) {
      childIds.push(parentList[i].id);
    }

    this.parentNodeList = newParentNodeList;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.rootId = lastParent!.value.id;
    this.loadingParentNodeList = false;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.openNodes(lastParent!, childIds);
  }

  private openNodes(node: TreeNode, childIds: string[]): Observable<boolean> {
    return this.openNode(node)
      .pipe(switchMap(() => {
        let foundNode: TreeNode | undefined;
        if (childIds.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const child of node.children!) {
            if (child.value.id === childIds[0]) {
              foundNode = child;
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
        for (const child of children) {
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            state: TreeStateService.getInitialState(child, this.skipParams!, node)
          }));

          node.children = nodes;
          return nodes;
        })
      );
  }
}
