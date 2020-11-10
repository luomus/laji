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
      isExpanded: skipped && parentNode && parentNode.state.isExpanded,
      isSkipped: skipped,
      loadingCount: 0
    };
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
