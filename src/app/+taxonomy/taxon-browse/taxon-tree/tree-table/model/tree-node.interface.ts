export interface TreeNode {
  id: string;
  hasChildren: boolean;
  children?: TreeNode[];
}

export interface TreeNodeState {
  level: number;
  isExpanded: boolean;
  isFirstChild: boolean;
  isSkipped: boolean;
  isLoading: boolean;
}

