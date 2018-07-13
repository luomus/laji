export interface TreeNode {
  id: string;
  hasChildren: boolean;
  isExpanded?: boolean;
  isLoading?: boolean;
  isSkipped?: boolean;
  isFirstChild?: boolean;
  children?: TreeNode[];
  level: number;
}
