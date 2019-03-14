import { TreeNode, TreeNodeState, TreeNodeValue, TreeSkipParameter } from '../model/tree.interface';

export class TreeStateService {
  constructor() {}

  static getInitialState(nodeValue: TreeNodeValue, skipParams: TreeSkipParameter[], parentNode?: TreeNode): TreeNodeState {
    const skipped = this.isSkipped(nodeValue, skipParams);
    return {
      isExpanded: skipped && parentNode && parentNode.state.isExpanded,
      isSkipped: skipped,
      loadingCount: 0
    };
  }

  static updateAllStates(parentNodeList: TreeNode[], skipParams: TreeSkipParameter[]): TreeNode[] {
    let prevParent: TreeNode;

    for (let i = 0; i < parentNodeList.length - 1; i++) {
      const node = parentNodeList[i];
      this.updateState(node, skipParams, prevParent);
      prevParent = node;
    }

    return this.updateStates(parentNodeList[parentNodeList.length - 1], skipParams);
  }

  private static updateStates(rootNode: TreeNode, skipParams: TreeSkipParameter[]): TreeNode[] {
    const nodesMissingChildren = [];
    this.update([rootNode], skipParams, nodesMissingChildren);
    return nodesMissingChildren;
  }

  private static update(
    nodes: TreeNode[],
    skipParams: TreeSkipParameter[],
    nodesMissingChildren: TreeNode[],
    parentNode?: TreeNode,
    virtualParent?: TreeNode
  ) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      this.updateState(node, skipParams, parentNode);

      if (node.children) {
        this.update(node.children, skipParams, nodesMissingChildren, node, node.state.isSkipped ? virtualParent : node);
      } else if (node.state.isExpanded && nodesMissingChildren.indexOf(virtualParent) === -1 && virtualParent) {
        nodesMissingChildren.push(virtualParent);
      }
    }
  }

  private static updateState(node: TreeNode, skipParams: TreeSkipParameter[], parentNode?: TreeNode) {
    const skipped = this.isSkipped(node.value, skipParams);

    if (skipped && parentNode && parentNode.state.isExpanded) {
      node.state.isExpanded = true;
    }
    node.state.isSkipped = skipped;
  }

  private static isSkipped(nodeValue: TreeNodeValue, params: TreeSkipParameter[]): boolean {
    if (params && params.length > 0) {
      for (let i = 0; i < params.length; i++) {
        const key = params[i].key;
        const values = params[i].values;
        const isWhiteList = params[i].isWhiteList;

        for (let j = 0; j < values.length; j++) {
          if (nodeValue[key] === values[j]) {
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
