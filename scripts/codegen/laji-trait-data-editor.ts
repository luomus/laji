import * as ts from 'typescript';
import * as fs from 'fs';
import { getNestedPropertyType, LeafType, traverseType, accDatatableColumnsRecursive, generateDatatableColumns } from './shared';

const generateDatasetTraitEditor = () => {
  const program = ts.createProgram(['./projects/laji-api-client-b/generated/api.d.ts'], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile('./projects/laji-api-client-b/generated/api.d.ts');
  ts.forEachChild(sourceFile!, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'paths') {
      const rowSearch = node.members.find(member => ts.isPropertySignature(member) && (member.name as ts.Identifier).text === '/trait/rows/search');
      const rowSearchType = checker.getTypeAtLocation(rowSearch!);
      const resultsType = getNestedPropertyType(rowSearchType, ['get', 'responses', '200', 'content', 'application/json'], checker);
      const resultType = checker.getTypeArguments(resultsType as ts.TypeReference)[0];
      (() => {
        const tree = traverseType(resultType, checker);
        const cols = accDatatableColumnsRecursive(tree).filter(n => n[0] !== 'traits');
        generateDatatableColumns(cols, './projects/laji/src/app/+trait-db/trait-db-datasets/data-editor/data-editor-search-table-columns.ts');
      })();
      (() => {
        const traitsType = getNestedPropertyType(resultType, ['traits'], checker);
        const traitType = checker.getTypeArguments(traitsType as ts.TypeReference)[0];
        const tree = traverseType(traitType, checker);
        const cols = accDatatableColumnsRecursive(tree).filter(n => n[0] !== 'id');
        generateDatatableColumns(cols, './projects/laji/src/app/+trait-db/trait-db-datasets/data-editor/data-editor-search-table-columns-traits.ts');
      })();
    }
  });
};

const main = () => {
  generateDatasetTraitEditor();
};

main();
