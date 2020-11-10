export interface TreeNode {
  value: TreeNodeValue;
  state: TreeNodeState;
  children?: TreeNode[];
}

export interface TreeNodeValue {
  id: string;
  hasChildren: boolean;
  [key: string]: any;
}

export interface TreeNodeState {
  isExpanded: boolean;
  isSkipped: boolean;
  loadingCount: number;
}

export interface TreeSkipParameter {
  key: string;
  values: string[];
  isWhiteList?: boolean;
}
