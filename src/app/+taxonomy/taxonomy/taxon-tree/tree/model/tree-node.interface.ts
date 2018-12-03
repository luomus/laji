export interface TreeNode {
  id: string;
  hasChildren: boolean;
  children?: TreeNode[];
}

export interface TreeNodeState {
  isExpanded: boolean;
  isSkipped: boolean;
  isHidden: boolean;
  loadingCount: number;
}
