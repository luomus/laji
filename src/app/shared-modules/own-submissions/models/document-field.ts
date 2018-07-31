export type DocumentField = DocumentFieldNode | DocumentFieldLeaf;

type DocumentFieldNode = DocumentFieldNodeKnownProps & DocumentFieldNodeUnknownProps;

interface DocumentFieldNodeKnownProps {
  '@multipleBy'?: number
}

interface DocumentFieldNodeUnknownProps {
  [key: string]: DocumentFieldNode | DocumentFieldLeaf;
}

interface DocumentFieldLeaf {
  value: string,
  label: string,
  used: boolean,
  enums?: any
}
