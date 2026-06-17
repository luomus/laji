import ts from 'typescript';
import {
  getNestedPropertyType, traverseType, accDatatableColumnsRecursive, generateDatatableColumns,
  ObjectNode, replaceDatatableColumnLabelsFromMetadata
} from './shared/shared';

const generateDatasetTraitEditor = async () => {
  const program = ts.createProgram(['./projects/laji-api-client-b/generated/api.d.ts'], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile('./projects/laji-api-client-b/generated/api.d.ts');
  const tasks = [] as Promise<void>[];
  ts.forEachChild(sourceFile!, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'paths') {
      tasks.push((async () => {
        const rowSearch = node.members.find(member => ts.isPropertySignature(member) && (member.name as ts.Identifier).text === '/trait/rows/search');
        const rowSearchType = checker.getTypeAtLocation(rowSearch!);
        const resultsType = getNestedPropertyType(rowSearchType, ['get', 'responses', '200', 'content', 'application/json'], checker);
        const resultType = checker.getTypeArguments(resultsType as ts.TypeReference)[0];
        await (async () => {
          const tree = traverseType(resultType, checker);
          console.assert(tree._tag === 'object');
          const cols = accDatatableColumnsRecursive(<ObjectNode>tree).filter(n => n.path[0] !== 'traits');
          const labeledCols = await replaceDatatableColumnLabelsFromMetadata(cols, 'TDFX.traitSearchRow');
          generateDatatableColumns(labeledCols, './projects/laji/src/app/+trait-db/trait-db-datasets/data-editor/data-editor-search-table-columns.ts');
        })();
        await (async () => {
          const traitsType = getNestedPropertyType(resultType, ['traits'], checker);
          const traitType = checker.getTypeArguments(traitsType as ts.TypeReference)[0];
          const tree = traverseType(traitType, checker);
          console.assert(tree._tag === 'object');
          const cols = accDatatableColumnsRecursive(<ObjectNode>tree).filter(n => n.path[0] !== 'id');
          const labeledCols = await replaceDatatableColumnLabelsFromMetadata(cols, 'TDFX.traitValue');
          generateDatatableColumns(labeledCols, './projects/laji/src/app/+trait-db/trait-db-datasets/data-editor/data-editor-search-table-columns-traits.ts');
        })();
      })());
    }
  });
  await Promise.all(tasks);
};

const main = async () => {
  await generateDatasetTraitEditor();
};

main();
