export interface DocumentFieldNode {
  [key: string]: DocumentFieldNode | DocumentField
}

export interface DocumentField {
  value: string,
  label: string,
  used: boolean,
  enums?: any
}
