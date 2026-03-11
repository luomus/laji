/* eslint-disable no-bitwise */
import ts from 'typescript';
import { getNestedPropertyType, traverseType, generateDatatableColumns,
  GeneratedDatatableColumn,
  accDatatableColumnsRecursive, generateExportObjectLiteral, ObjectNode,
  replaceDatatableColumnLabelsFromMetadata } from './shared/shared';

const generateFilters = (cols: GeneratedDatatableColumn[]) => {
  const filters = {} as any;
  cols.forEach(({ path, node: leaf }) => {
    const prop = path.join('.');
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
