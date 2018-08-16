import { TreeNode, TreeNodeState } from '../model/tree-node.interface';
import { Observable } from 'rxjs';

interface TreeStateInterface {[key: string]: TreeNodeState}

export class TreeState {
  state: TreeStateInterface = {};
  pendingChildren: {[key: string]: Observable<TreeNode[]>} = {};

  private skipParams: {key: string, values: string[], isWhiteList?: boolean}[];

  constructor(nodes: TreeNode[], skipParams?: {key: string, values: string[], isWhiteList?: boolean}[]) {
    this.skipParams = skipParams;
    this.initNodeStates(nodes);
  }

  update(nodes: TreeNode[]): TreeNode[] {
    const missingChildren = [];
    this.updateNodeStates(nodes, missingChildren);
    return missingChildren;
  }

  setSkipParams(skipParams: {key: string, values: string[], isWhiteList?: boolean}[]) {
    this.skipParams = skipParams;
  }

  updateNodeState(node: TreeNode, childNbr: number, parentId?: string): TreeNodeState {
    const skipped = this.getSkipped(node);
    const expanded = this.state[node.id] ? this.state[node.id].isExpanded : false;
    const parentState = parentId ? this.state[parentId] : undefined;

    this.state[node.id] = {
      level: !parentState ? 0 : (parentState.isSkipped ? parentState.level : parentState.level + 1),
      isFirstChild: childNbr === 0 && (!parentState || !parentState.isSkipped || parentState.isFirstChild),
      isExpanded: skipped && parentState.isExpanded ? true : expanded,
      isSkipped: skipped,
      isLoading: false
    };

    return this.state[node.id];
  }

  private initNodeStates(nodes: TreeNode[], parentId?: string) {
    for (let i = 0; i < nodes.length; i++) {
      const state = this.updateNodeState(nodes[i], i, parentId);

      if (nodes[i].children) {
        state.isExpanded = true;
        this.initNodeStates(nodes[i].children, nodes[i].id);
      }
    }
  }

  private updateNodeStates(nodes: TreeNode[], missingList: TreeNode[], parentId?: string, virtualParent?: TreeNode) {
    for (let i = 0; i < nodes.length; i++) {
      const state = this.updateNodeState(nodes[i], i, parentId);

      if (nodes[i].children) {
        this.updateNodeStates(nodes[i].children, missingList, nodes[i].id, state.isSkipped ? virtualParent : nodes[i]);
      } else if (state.isExpanded && missingList.indexOf(virtualParent) === -1) {
        missingList.push(virtualParent);
      }
    }
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
}
