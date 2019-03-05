import { TreeNode, TreeNodeState } from '../model/tree-node.interface';
import { Observable } from 'rxjs';

interface TreeStateInterface {[key: string]: TreeNodeState; }

export class TreeState {
  state: TreeStateInterface = {};
  pendingChildren: {[key: string]: Observable<TreeNode[]>} = {};

  private skipParams: {key: string, values: string[], isWhiteList?: boolean}[];

  constructor(
    nodes: TreeNode[],
    skipParams?: {key: string, values: string[], isWhiteList?: boolean}[]
  ) {
    this.skipParams = skipParams;
    this.initNodeStates(nodes);
  }

  setSkipParams(nodes: TreeNode[], skipParams: {key: string, values: string[], isWhiteList?: boolean}[]) {
    this.skipParams = skipParams;
    const missingChildren = [];
    this.updateAndCheckMissing(nodes, missingChildren);
    return missingChildren;
  }

  updateNodeStates(nodes: TreeNode[], parentId?: string, afterStateUpdate?: (node: TreeNode, state: TreeNodeState) => void) {
    for (let i = 0; i < nodes.length; i++) {
      const state = this.updateNodeState(nodes[i], parentId);

      if (afterStateUpdate) {
        afterStateUpdate(nodes[i], state);
      }
    }
  }

  private initNodeStates(nodes: TreeNode[], parentId?: string) {
    this.updateNodeStates(nodes, parentId, (node: TreeNode, state: TreeNodeState) => {
      if (node.children) {
        state.isExpanded = true;
        this.initNodeStates(node.children, node.id);
      }
    });
  }

  private updateAndCheckMissing(nodes: TreeNode[], missingList: TreeNode[], parentId?: string, virtualParent?: TreeNode) {
    this.updateNodeStates(nodes, parentId, (node: TreeNode, state: TreeNodeState) => {
      if (node.children) {
        this.updateAndCheckMissing(node.children, missingList, node.id, state.isSkipped ? virtualParent : node);
      } else if (state.isExpanded && missingList.indexOf(virtualParent) === -1 && virtualParent) {
        missingList.push(virtualParent);
      }
    });
  }

  private updateNodeState(node: TreeNode, parentId?: string): TreeNodeState {
    const skipped = this.checkConditions(node, this.skipParams);
    const expanded = this.state[node.id] ? this.state[node.id].isExpanded : false;
    const parentState = parentId ? this.state[parentId] : undefined;

    this.state[node.id] = {
      isExpanded: skipped && parentState && parentState.isExpanded ? true : expanded,
      isSkipped: skipped,
      loadingCount: this.state[node.id] ? this.state[node.id].loadingCount : 0
    };

    return this.state[node.id];
  }

  private checkConditions(node: TreeNode, params: {key: string, values: string[], isWhiteList?: boolean}[]): boolean {
    if (params && params.length > 0) {
      for (let i = 0; i < params.length; i++) {
        const key = params[i].key;
        const values = params[i].values;
        const isWhiteList = params[i].isWhiteList;

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
