import * as merge from 'deepmerge';
import { Document } from '../model/Document';

export class Util {
  /**
   * Clones the object using JSON stringify
   * @returns any
   */
  public static clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  /**
   * Checks the equality of arrays
   * @returns boolean
   */
  public static equalsArray(a1, a2) {
    return a1 && a2 && a1.length === a2.length && a1.sort().every((value, index) => value === a2.sort()[index]);
  }

  /**
   * Checks if the given value is empty object
   *
   * Values that are not objects are considered to be empty objects
   *
   * @returns boolean
   */
  public static isEmptyObj(value: any) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return true;
    }
    return Object.keys(value).length === 0;
  }

  /**
   * Remove undefined values from object and any key specified by the key parameter
   *
   * @param obj object to remove keys from
   * @param keys array of keys that should be removed
   */
  public static removeFromObject(obj: object, keys?: string[]) {
    if (typeof obj !== 'object') {
      return obj;
    }
    return Object.keys(obj).reduce((cumulative, current) => {
      if (typeof obj[current] !== 'undefined' && (!keys || keys.indexOf(current) === -1)) {
        cumulative[current] = obj[current];
      }
      return cumulative;
    }, {});
  }

  public static JSONPathToJSONPointer(jsonPath: string): string {
    let pathAsJSONPointer = jsonPath[0] === '$' ? jsonPath.substring(1, jsonPath.length) : jsonPath; // Remove first '$'
    pathAsJSONPointer = pathAsJSONPointer
      .replace(/\./g, '/')
      .replace(/\[/g, '/')
      .replace(/\]/g, '/');
    if (pathAsJSONPointer[pathAsJSONPointer.length - 1] === '/') {
      pathAsJSONPointer = pathAsJSONPointer.substring(0, pathAsJSONPointer.length - 1);
    }
    return pathAsJSONPointer;
  }

  public static parseJSONPath(object: any, jsonPath: string): any {
    // Both jsonpath and jsonpath-plus cause problems with the production build,
    // so we convert the json paths to json pointers.
    return this.parseJSONPointer(object, this.JSONPathToJSONPointer(jsonPath));
  }

  public static parseJSONPointer(object: any, jsonPointer: string, create = false): any {
    const splitPath = String(jsonPointer).split('/').filter(s => s !== undefined && s !== '');
    return splitPath.reduce((o, s, i) => {
      if (create && !o[s]) {
        if (!isNaN(+splitPath[i + 1])) {
          o[s] = [];
        } else {
          o[s] = {};
        }
      }
      return o && o[s] || undefined;
    }, object);
  }

  public static updateWithJSONPointer(object: any, jsonPointer, value): any {
    const splits = jsonPointer.split('/');
    const last = splits.pop();

    const lastContainerPointer = splits.join('/');
    const lastContainer = this.parseJSONPointer(object, lastContainerPointer, true);
    if (lastContainer) {
      lastContainer[last] = value;
    }
    return object;
  }

  public static arrayCombineMerge(target, source, options) {
    const destination = target.slice();

    source.forEach(function(e, i) {
      if (typeof destination[i] === 'undefined') {
        const cloneRequested = options.clone !== false;
        const shouldClone = cloneRequested && options.isMergeableObject(e);
        destination[i] = shouldClone ? Util.mergeClone(e, options) : e;
      } else if (options.isMergeableObject(e)) {
        destination[i] = merge(target[i], e, options);
      } else if (target.indexOf(e) === -1) {
        destination.push(e);
      }
    });
    return destination;
  }


  public static isLocalNewestDocument(local: Document, remote: Document): boolean {
    if (remote && remote.dateEdited) {
      if (!local || !local.dateEdited ||
        Util.getDateFromString(local.dateEdited) < Util.getDateFromString(remote.dateEdited)) {
        return false;
      }
    }
    return true;
  }

  private static getDateFromString(dateString) {
    const reggie = /(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
    const dateArray = reggie.exec(dateString);
    return new Date(
      (+dateArray[1]),
      (+dateArray[2]) - 1, // Careful, month starts at 0!
      (+dateArray[3]),
      (+dateArray[4]),
      (+dateArray[5]),
      (+dateArray[6])
    );
  }

  private static mergeClone(value, options) {
    return merge(Util.mergeEmptyTarget(value), value, options);
  }

  private static mergeEmptyTarget(value) {
    return Array.isArray(value) ? [] : {};
  }
}
