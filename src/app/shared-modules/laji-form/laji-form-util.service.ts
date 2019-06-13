import { schemaJSONPointer as schemaJSONPointerFunc } from 'laji-form/lib/utils';

export class LajiFormUtil {
  public static schemaJSONPointer(schema: any, path: string): string {
    return schemaJSONPointerFunc(schema, path);
  }
}
