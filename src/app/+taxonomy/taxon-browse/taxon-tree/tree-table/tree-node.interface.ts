export interface TreeNode {
  id: string;
  hasChildren: boolean;
  isExpanded?: boolean;
  isRoot?: boolean;
  isFirstChild?: boolean;
  children?: TreeNode[];
  level?: number;
}
