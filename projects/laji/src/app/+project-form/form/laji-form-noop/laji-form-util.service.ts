import { schemaJSONPointer as schemaJSONPointerFunc, removeLajiFormIds } from '@luomus/laji-form/lib/utils';
import { createTmpIdTree } from '@luomus/laji-form/lib/services/id-service';

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
