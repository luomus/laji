/* eslint-disable no-bitwise */
import * as ts from 'typescript';
import * as fs from 'fs';

interface EnumNode {
  _tag: 'enum';
  variants: string[];
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

export type LeafType = EnumNode | StringNode | BooleanNode | NumberNode | ArrayNode;

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

export const traverseType = (type: ts.Type, checker: ts.TypeChecker): any => {
  if (type.getFlags() & ts.TypeFlags.String) {
    return { _tag: 'string' } as StringNode;
  } else if (type.getFlags() & ts.TypeFlags.Number) {
    return { _tag: 'number' } as NumberNode;
  } else if (type.getFlags() & ts.TypeFlags.Boolean) {
    return { _tag: 'boolean' } as BooleanNode;
  } else if (type.isUnion()) {
    return {
      _tag: 'enum',
      variants: type.types.map(t => t.isStringLiteral() ? t.value : t.getFlags())
    } as EnumNode;
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
      const o = {} as any;
      type.getProperties().forEach(prop => {
        o[prop.name] = traverseType(checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!), checker);
      });
      return o;
    }
  } else {
    console.warn('Unknown type');
  }
  return { _tag: 'unknown' } as UnknownNode;
};

export const accDatatableColumnsRecursive = (subtree: any): [string, LeafType][] => {
  const out = [] as [string, LeafType][];
  Object.entries(subtree).forEach(([k, v]) => {
    if ('_tag' in (v as any)) {
      out.push([k, (v as LeafType)]);
    } else {
      const leaves = accDatatableColumnsRecursive(v);
      const mappedLeaves = leaves.map(([path, leaf]) => ([k + '.' + path, leaf] as [string, LeafType]));
      out.push(...mappedLeaves);
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

export const generateDatatableColumns = (cols: [string, LeafType][], path: string) =>
  generateExportObjectLiteral(cols, 'cols', path);

