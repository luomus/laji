import { schemaJSONPointer as schemaJSONPointerFunc, createTmpIdTree, removeLajiFormIds } from 'laji-form/lib/utils';

export class LajiFormUtil {
  public static schemaJSONPointer(schema: any, path: string): string {
    return schemaJSONPointerFunc(schema, path);
  }
  public static scrollIntoViewIfNeeded(elem) {
  }
  public static removeLajiFormIds(formData: any, schema: any) {
    return removeLajiFormIds(formData, createTmpIdTree(schema));
  }
}
