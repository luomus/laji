import { schemaJSONPointer as schemaJSONPointerFunc, scrollIntoViewIfNeeded, createTmpIdTree, removeLajiFormIds } from 'laji-form/lib/utils';
import { LajiFormComponent } from './laji-form/laji-form.component';

export class LajiFormUtil {
  public static schemaJSONPointer(schema: any, path: string): string {
    return schemaJSONPointerFunc(schema, path);
  }
  public static scrollIntoViewIfNeeded(elem) {
    scrollIntoViewIfNeeded(elem, LajiFormComponent.TOP_OFFSET, LajiFormComponent.BOTTOM_OFFSET);
  }
  public static removeLajiFormIds(formData: any, schema: any) {
    return removeLajiFormIds(formData, createTmpIdTree(schema));
  }
}
