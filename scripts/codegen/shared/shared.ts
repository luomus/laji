/* eslint-disable no-bitwise */
import ts from 'typescript';
import fs from 'fs';
import {
  getAltValuesFetcher,
  getClassPropertiesFetcher,
  getRangeValuesFetcher,
  getPropertyAltFetcher,
  MetadataAlt,
  MetadataProperty,
  MetadataRangeValue
} from './laji-api';

export interface EnumVariant<T extends string> {
  label: string;
  value: T;
}

interface EnumNode<T extends string> {
  _tag: 'enum';
  variants: EnumVariant<T>[];
}

interface ArrayNode {
  _tag: 'array';
  elementType: any;
}

interface StringNode {
  _tag: 'string';
}

interface BooleanNode {
  _tag: 'boolean';
}

interface NumberNode {
  _tag: 'number';
}

interface UnknownNode {
  _tag: 'unknown';
}

export type LeafNode = EnumNode<string> | StringNode | BooleanNode | NumberNode | ArrayNode;

export interface ObjectNode {
  _tag: 'object';
  props: { [key: string]: TreeNode };
}

export type TreeNode = LeafNode | ObjectNode | UnknownNode;

export const getNestedPropertyType = (type: ts.Type, propertyPath: string[], checker: ts.TypeChecker) => {
  let currentType = type;

  for (const propertyName of propertyPath) {
    const propertySymbol = currentType.getProperties().find(
      (prop) => prop.getName() === propertyName
    );

    if (!propertySymbol || !propertySymbol.valueDeclaration) {
      console.error(`Property ${propertyName} not found.`);
      return;
    }

    currentType = checker.getTypeOfSymbolAtLocation(propertySymbol, propertySymbol.valueDeclaration);
  }

  return currentType;
};

const initEnumVar = <T extends string>(val: T) => ({
  label: val,
  value: val
} as EnumVariant<T>);

export const traverseType = (type: ts.Type, checker: ts.TypeChecker): TreeNode => {
  if (type.getFlags() & ts.TypeFlags.String) {
    return { _tag: 'string' } as StringNode;
  } else if (type.getFlags() & ts.TypeFlags.Number) {
    return { _tag: 'number' } as NumberNode;
  } else if (type.getFlags() & ts.TypeFlags.Boolean) {
    return { _tag: 'boolean' } as BooleanNode;
  } else if (type.isUnion()) {
    return {
      _tag: 'enum',
      variants: type.types.map(t => initEnumVar(t.isStringLiteral() ? t.value : t.getFlags().toString()))
    } as EnumNode<string>;
  } else if (type.isIntersection()) {
    console.warn('unimplemented intersection type');
  } else if (type.isClassOrInterface()) {
    console.warn('unimplemented class or interface');
  } else if (type.getFlags() & ts.TypeFlags.Object) {
    if (type.symbol?.getName() === 'Array') {
      const elementType = checker.getTypeArguments(type as ts.TypeReference)[0];
      return {
        _tag: 'array',
        elementType: traverseType(elementType, checker)
      } as ArrayNode;
    } else {
      const o = {
        _tag: 'object',
        props: {},
      } as ObjectNode;
      type.getProperties().forEach(prop => {
        o.props[prop.name] = traverseType(checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!), checker);
      });
      return o;
    }
  } else {
    console.warn('Unknown type');
  }
  return { _tag: 'unknown' } as UnknownNode;
};

export interface GeneratedDatatableColumn {
  path: string[];
  label: string[];
  node: LeafNode;
}

export const accDatatableColumnsRecursive = (subtree: ObjectNode): GeneratedDatatableColumn[] => {
  const out = [] as GeneratedDatatableColumn[];
  Object.entries(subtree.props).forEach(([k, v]) => {
    if (v._tag === 'object') {
      const leaves = accDatatableColumnsRecursive(v);
      const mappedLeaves = leaves.map(col => ({
          path: [k, ...col.path],
          label: [k, ...col.label],
          node: col.node
        } as GeneratedDatatableColumn
      ));
      out.push(...mappedLeaves);
    } else {
      out.push(
        {
          path: [k],
          label: [k],
          node: v as LeafNode
        }
      );
    }
  });
  return out;
};

// only supports string/null/array/obj values atm
const valueToAST = (v: any, factory: ts.NodeFactory): ts.Expression => {
  if (typeof v === 'string') {
    return factory.createStringLiteral(v as string);
  } else if (v === null) {
    return factory.createNull();
  } else if (Array.isArray(v)) {
    return factory.createArrayLiteralExpression(
      v.map(el => valueToAST(el, factory))
    );
  } else {
    return factory.createObjectLiteralExpression(
      Object.entries(v).map(([k, v2]) =>
        factory.createPropertyAssignment(k, valueToAST(v2, factory)))
    );
  }
};

export const generateExportObjectLiteral = (obj: any, name: string, path: string) => {
  const factory = ts.factory;
  const variableStatement = factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList([
      factory.createVariableDeclaration(
        name, undefined, undefined,
        valueToAST(obj, factory)
      ),
    ], ts.NodeFlags.Const)
  );
  const sourceFile = ts.createSourceFile(path, '', ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(ts.EmitHint.Unspecified, variableStatement, sourceFile);
  fs.writeFileSync(path, `/* eslint-disable @typescript-eslint/quotes */\n/* eslint-disable max-len */\n/*\nGenerated file. Do not edit manually!\n*/\n\n${result}\n`);
};

export const generateDatatableColumns = (cols: GeneratedDatatableColumn[], path: string) =>
  generateExportObjectLiteral(cols, 'cols', path);

const getRangeId = (range: unknown): string | undefined => {
  if (typeof range === 'string') {
    return range;
  }
  if (Array.isArray(range) && typeof range[0] === 'string') {
    return range[0];
  }
  return undefined;
};

const mapPathLabelsWithMetadata = async (
  path: string[],
  rootClass: string,
  getClassProperties: (className: string) => Promise<MetadataProperty[] | null>,
) => {
  const mappedLabel = [] as string[];
  let currentClass = rootClass;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    const classProperties = await getClassProperties(currentClass);

    if (!classProperties) {
      mappedLabel.push(...path.slice(i));
      break;
    }

    const matchingProperty = classProperties.find(prop => prop.shortName === segment);
    if (!matchingProperty) {
      mappedLabel.push(...path.slice(i));
      break;
    }

    mappedLabel.push(matchingProperty.label || segment);

    if (i < path.length - 1) {
      const nextClass = getRangeId(matchingProperty.range);
      if (!nextClass) {
        mappedLabel.push(...path.slice(i + 1));
        break;
      }
      currentClass = nextClass;
    }
  }

  return mappedLabel;
};

const resolveLeafPropertyFromPath = async (
  path: string[],
  rootClass: string,
  getClassProperties: (className: string) => Promise<MetadataProperty[] | null>,
) => {
  let currentClass = rootClass;
  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    const classProperties = await getClassProperties(currentClass);
    if (!classProperties) {
      return null;
    }
    const matchingProperty = classProperties.find(prop => prop.shortName === segment);
    if (!matchingProperty) {
      return null;
    }
    if (i === path.length - 1) {
      return matchingProperty;
    }
    const nextClass = getRangeId(matchingProperty.range);
    if (!nextClass) {
      return null;
    }
    currentClass = nextClass;
  }
  return null;
};

const mapEnumVariantsFromMetadata = (
  variants: EnumVariant<string>[],
  altValues: (MetadataAlt | MetadataRangeValue)[],
): EnumVariant<string>[] => {
  const altLabelByValue = new Map(altValues.map(({ id, value }) => [id, value]));
  return variants.map(v => ({
    ...v,
    label: altLabelByValue.get(v.value) ?? v.label,
  }));
};

export const replaceDatatableColumnLabelsFromMetadata = async (
  cols: GeneratedDatatableColumn[],
  rootClass: string,
) => {
  const getClassProperties = getClassPropertiesFetcher();
  const getPropertyAlt = getPropertyAltFetcher();
  const getAltValues = getAltValuesFetcher();
  const getRangeValues = getRangeValuesFetcher();

  const mappedColumns = [] as GeneratedDatatableColumn[];
  for (const col of cols) {
    const mappedLabel = await mapPathLabelsWithMetadata(col.path, rootClass, getClassProperties);
    let mappedNode = col.node;
    if (col.node._tag === 'enum' || (col.node._tag === 'array' && col.node.elementType?._tag === 'enum')) {
      const matchingProperty = await resolveLeafPropertyFromPath(col.path, rootClass, getClassProperties);
      if (matchingProperty) {
        const rangeId = getRangeId(matchingProperty.range);
        const altValues = await getPropertyAlt(matchingProperty.property)
          ?? (rangeId ? await getAltValues(rangeId) : null)
          ?? (rangeId ? await getRangeValues(rangeId) : null);
        if (altValues) {
          if (col.node._tag === 'enum') {
            mappedNode = {
              ...col.node,
              variants: mapEnumVariantsFromMetadata(col.node.variants, altValues),
            };
          } else if (col.node._tag === 'array' && col.node.elementType?._tag === 'enum') {
            mappedNode = {
              ...col.node,
              elementType: {
                ...col.node.elementType,
                variants: mapEnumVariantsFromMetadata(col.node.elementType.variants, altValues),
              }
            } as ArrayNode;
          }
        }
      }
    }
    mappedColumns.push({
      ...col,
      label: mappedLabel,
      node: mappedNode,
    });
  }
  return mappedColumns;
};
