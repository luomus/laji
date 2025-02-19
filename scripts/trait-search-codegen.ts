/* eslint-disable no-bitwise */
import * as ts from 'typescript';
import * as fs from 'fs';

const program = ts.createProgram(['./projects/laji-api-client-b/generated/api.d.ts'], {});
const checker = program.getTypeChecker();

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

type LeafType = EnumNode | StringNode | BooleanNode | NumberNode | ArrayNode;

const getNestedPropertyType = (type: ts.Type, propertyPath: string[]) => {
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

const traverseType = (type: ts.Type): any => {
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
        elementType: traverseType(elementType)
      } as ArrayNode;
    } else {
      const o = {} as any;
      type.getProperties().forEach(prop => {
        o[prop.name] = traverseType(checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!));
      });
      return o;
    }
  } else {
    console.warn('Unknown type');
  }
  return { _tag: 'unknown' } as UnknownNode;
};

const accDatatableColumnsRecursive = (subtree: any): [string, LeafType][] => {
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

const generateExportObjectLiteral = (obj: any, name: string, path: string) => {
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

const generateDatatableColumns = (tree: any) => {
  const cols = accDatatableColumnsRecursive(tree);
  console.log(cols);
  generateExportObjectLiteral(cols, 'cols', './projects/laji/src/app/+trait-db/shared/trait-search/trait-search-table-columns.ts');
};

const generateFilters = (tree: any) => {
  const cols = accDatatableColumnsRecursive(tree);
  const filters = {} as any;
  cols.forEach(([prop, leaf]) => {
    const formKey = prop.replace(/\./g, '');
    if (leaf._tag === 'string') {
      filters[formKey] = {
        prop,
        filterType: 'string',
        defaultValue: null
      };
    } else if (leaf._tag === 'number') {
      filters[formKey] = {
        prop,
        filterType: 'number',
        defaultValue: null
      };
    } else if (leaf._tag === 'boolean') {
      filters[formKey] = {
        prop,
        filterType: 'boolean',
        defaultValue: null
      };
    } else if (leaf._tag === 'array') {
      filters[formKey] = {
        prop,
        filterType: 'array',
        defaultValue: null,
        elementType: leaf.elementType
      };
    } else if (leaf._tag === 'enum') {
      filters[formKey] = {
        prop,
        filterType: 'enum',
        defaultValue: null,
        range: leaf.variants
      };
    }
  });
  generateExportObjectLiteral(filters, 'filters', './projects/laji/src/app/+trait-db/shared/trait-search/trait-search-filters/filters.ts');
};

const main = () => {
  const sourceFile = program.getSourceFile('./projects/laji-api-client-b/generated/api.d.ts');
  ts.forEachChild(sourceFile!, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'paths') {
      const traitSearch = node.members.find(member => ts.isPropertySignature(member) && (member.name as ts.Identifier).text === '/trait/search');
      const traitSearchType = checker.getTypeAtLocation(traitSearch!);
      const resultsType = getNestedPropertyType(traitSearchType, ['get', 'responses', '200', 'content', 'application/json', 'results']);
      const resultType = checker.getTypeArguments(resultsType as ts.TypeReference)[0];
      const tree = traverseType(resultType);
      generateDatatableColumns(tree);
      generateFilters(tree);
    }
  });
};

main();
