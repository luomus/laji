export interface TreeNode {
  id: string;
  hasChildren: boolean;
  children?: TreeNode[];
  leafCount?: number;
}

export interface TreeNodeState {
  level: number;
  isExpanded: boolean;
  isFirstChild: boolean;
  isSkipped: boolean;
  isHidden: boolean;
  loadingCount: number;
}
