import { schemaJSONPointer as schemaJSONPointerFunc, scrollIntoViewIfNeeded, removeLajiFormIds } from '@luomus/laji-form/lib/utils';
import { createTmpIdTree } from '@luomus/laji-form/lib/services/id-service';
import { LajiFormComponent } from './laji-form/laji-form.component';

export class LajiFormUtil {
  public static schemaJSONPointer(schema: any, path: string): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return schemaJSONPointerFunc(schema, path)!;
  }
  public static scrollIntoViewIfNeeded(elem: any) {
    scrollIntoViewIfNeeded(elem, LajiFormComponent.TOP_OFFSET, LajiFormComponent.BOTTOM_OFFSET);
  }
  public static removeLajiFormIds(formData: any, schema: any) {
    return removeLajiFormIds(formData, createTmpIdTree(schema));
  }
}
