/* eslint-disable no-bitwise */
import * as ts from 'typescript';
import * as fs from 'fs';
import { getNestedPropertyType, LeafType, traverseType, generateDatatableColumns,
  accDatatableColumnsRecursive, generateExportObjectLiteral } from './shared';

const generateFilters = (cols: [string, LeafType][]) => {
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

const generateTraitSearch = () => {
  const program = ts.createProgram(['./projects/laji-api-client-b/generated/api.d.ts'], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile('./projects/laji-api-client-b/generated/api.d.ts');
  ts.forEachChild(sourceFile!, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'paths') {
      const traitSearch = node.members.find(member => ts.isPropertySignature(member) && (member.name as ts.Identifier).text === '/trait/search');
      const traitSearchType = checker.getTypeAtLocation(traitSearch!);
      const resultsType = getNestedPropertyType(traitSearchType, ['get', 'responses', '200', 'content', 'application/json', 'results'], checker);
      const resultType = checker.getTypeArguments(resultsType as ts.TypeReference)[0];
      const tree = traverseType(resultType, checker);
      const cols = accDatatableColumnsRecursive(tree);
      generateDatatableColumns(cols, './projects/laji/src/app/+trait-db/shared/trait-search/trait-search-table-columns.ts');
      generateFilters(cols);
    }
  });
};

const main = () => {
  generateTraitSearch();
};

main();
