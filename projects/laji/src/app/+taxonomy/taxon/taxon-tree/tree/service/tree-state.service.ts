import { TreeNode, TreeNodeState, TreeNodeValue, TreeSkipParameter } from '../model/tree.interface';

export class TreeStateService {
  constructor() {}

  static getInitialState(
    nodeValue: TreeNodeValue,
    skipParams: TreeSkipParameter[],
    parentNode?: TreeNode
  ): TreeNodeState {
    const skipped = this.isSkipped(nodeValue, skipParams);
    return {
      isExpanded: !!(skipped && parentNode && parentNode.state.isExpanded),
      isSkipped: skipped,
      loadingCount: 0
    };
  }

  private static isSkipped(nodeValue: TreeNodeValue, params: TreeSkipParameter[]): boolean {
    if (params && params.length > 0) {
      for (const param of params) {
        const key = param.key;
        const values = param.values;
        const isWhiteList = param.isWhiteList;

        for (const value of values) {
          if (nodeValue[key] === value) {
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
