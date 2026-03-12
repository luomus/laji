/* eslint-disable no-bitwise */
import ts from 'typescript';
import { getNestedPropertyType, traverseType, generateDatatableColumns,
  GeneratedDatatableColumn,
  accDatatableColumnsRecursive, generateExportObjectLiteral, ObjectNode,
  replaceDatatableColumnLabelsFromMetadata } from './shared/shared';

const generateFilters = (cols: GeneratedDatatableColumn[]) => {
  const filters = {} as any;
  cols.forEach(({ path, node, label }) => {
    const prop = path.join('.');
    const formKey = prop.replace(/\./g, '');
    if (node._tag === 'string') {
      filters[formKey] = {
        prop,
        label,
        filterType: 'string',
        defaultValue: null
      };
    } else if (node._tag === 'number') {
      filters[formKey] = {
        prop,
        label,
        filterType: 'number',
        defaultValue: null
      };
    } else if (node._tag === 'boolean') {
      filters[formKey] = {
        prop,
        label,
        filterType: 'boolean',
        defaultValue: null
      };
    } else if (node._tag === 'array') {
      filters[formKey] = {
        prop,
        label,
        filterType: 'array',
        defaultValue: null,
        elementType: node.elementType
      };
    } else if (node._tag === 'enum') {
      filters[formKey] = {
        prop,
        label,
        filterType: 'enum',
        defaultValue: null,
        range: node.variants
      };
    }
  });
  generateExportObjectLiteral(filters, 'filters', './projects/laji/src/app/+trait-db/shared/trait-search/trait-search-filters/filters.ts');
};

const generateTraitSearch = async () => {
  const program = ts.createProgram(['./projects/laji-api-client-b/generated/api.d.ts'], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile('./projects/laji-api-client-b/generated/api.d.ts');
  const tasks = [] as Promise<void>[];
  ts.forEachChild(sourceFile!, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'paths') {
      tasks.push((async () => {
        const traitSearch = node.members.find(member => ts.isPropertySignature(member) && (member.name as ts.Identifier).text === '/trait/search');
        const traitSearchType = checker.getTypeAtLocation(traitSearch!);
        const resultsType = getNestedPropertyType(traitSearchType, ['get', 'responses', '200', 'content', 'application/json', 'results'], checker);
        const resultType = checker.getTypeArguments(resultsType as ts.TypeReference)[0];
        const tree = traverseType(resultType, checker);
        console.assert(tree._tag === 'object');
        const cols = accDatatableColumnsRecursive(<ObjectNode>tree);
        const labeledCols = await replaceDatatableColumnLabelsFromMetadata(cols, 'TDFX.traitSearchRow');
        generateDatatableColumns(labeledCols, './projects/laji/src/app/+trait-db/shared/trait-search/trait-search-table-columns.ts');
        generateFilters(labeledCols);
      })());
    }
  });
  await Promise.all(tasks);
};

const main = async () => {
  await generateTraitSearch();
};

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
