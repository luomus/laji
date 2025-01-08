import { NavigationEnd, Event } from '@angular/router';
import * as merge from 'deepmerge';
import { Document } from '../model/Document';

export type WithNonNullableKeys<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>;
};

export class Util {
  /**
   * Clones the object using JSON stringify
   * @returns any
   */
  public static clone(object: any) {
    return JSON.parse(JSON.stringify(object));
  }

  /**
   * Checks the equality of arrays
   * @returns boolean
   */
  public static equalsArray(a1?: any[], a2?: any[]) {
    return a1 && a2 && a1.length === a2.length && a1.every((value) => a2.includes(value));
  }

  /**
   * Return the elements that are missing from the another array
   */
  public static arrayDiff<T>(a1: T[], a2: T[]): T[] {
    if (!Array.isArray(a1)) {
      return Array.isArray(a2) ? a2 : [];
    }
    if (!Array.isArray(a2)) {
      return a1;
    }
    return a1
      .filter(x => !a2.includes(x))
      .concat(a2.filter(x => !a1.includes(x)));
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
  public static removeFromObject<T extends {[prop: string]: any}>(obj: T, keys?: string[]): Partial<T> {
    if (typeof obj !== 'object') {
      return obj;
    }
    return Object.keys(obj).reduce<Partial<T>>((cumulative, current: keyof T) => {
      if (typeof obj[current] !== 'undefined' && (!keys || keys.indexOf(current as string) === -1)) {
        cumulative[current] = obj[current];
      }
      return cumulative;
    }, {} as Partial<T>);
  }

  /**
   * Remove all undefined and null values from object
   *
   * @param obj object to remove keys from
   */
  public static withNonNullableValues<T extends {[prop: string]: any}, K extends keyof T>(obj: T): WithNonNullableKeys<T, K> {
    return Object.keys(obj).reduce((cumulative, current: keyof T) => {
      if (obj[current] !== undefined && obj[current] !== null) {
        (cumulative as any)[current] = obj[current];
      }
      return cumulative;
    }, {} as WithNonNullableKeys<T, K>);
  }


  /**
   * Add leading zero so that the length of return string will be 2
   */
  public static addLeadingZero(val: string | number): string {
    val = '' + val;
    if (val.length === 1) {
      return '0' + val;
    }
    return val;
  }

  public static JSONPathToJSONPointer(jsonPath: string): string {
    let pathAsJSONPointer = jsonPath[0] === '$' ? jsonPath.substring(1, jsonPath.length) : jsonPath; // Remove first '$'
    pathAsJSONPointer = pathAsJSONPointer
      .replace(/\./g, '/')
      .replace(/\[/g, '/')
      .replace(/]/g, '/');
    if (pathAsJSONPointer[pathAsJSONPointer.length - 1] === '/') {
      pathAsJSONPointer = pathAsJSONPointer.substring(0, pathAsJSONPointer.length - 1);
    }
    return pathAsJSONPointer;
  }

  public static parseJSONPath(object: any, jsonPath: string): any {
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

  public static updateWithJSONPointer(object: any, jsonPointer: string, value: any): any {
    const splits = jsonPointer.split('/');
    const last = splits.pop() as string;

    const lastContainerPointer = splits.join('/');
    const lastContainer = this.parseJSONPointer(object, lastContainerPointer, true);
    if (lastContainer) {
      lastContainer[last] = value;
    }
    return object;
  }

  public static arrayCombineMerge(target: any[], source: any[], options: any) {
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

  public static eventIsNavigationEnd(event: Event): event is NavigationEnd {
    return event instanceof NavigationEnd;
  }

  public static isLocalNewestDocument(local: Document, remote: Document): boolean {
    if (remote && remote.dateEdited) {
      if (!local || !local.dateEdited ||
        new Date(local.dateEdited) < new Date(remote.dateEdited)) {
        return false;
      }
    }
    return true;
  }

  public static hasOwnProperty<X extends Record<string, unknown>, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
  }

  public static removeUndefinedFromObject = <T extends Record<string, unknown>>(obj: T): T => (Object.keys(obj) as (keyof T)[]).reduce((cumulative, current) => {
      if (typeof obj[current] !== 'undefined') {
        cumulative[current] = obj[current];
      }
      return cumulative;
    }, {} as T);

  public static isObject(any: any): any is Record<string, unknown> {
    return typeof any === 'object' && any !== null && !Array.isArray(any);
  }

  private static mergeClone(value: any, options: any) {
    return merge(Util.mergeEmptyTarget(value), value, options);
  }

  private static mergeEmptyTarget(value: any) {
    return Array.isArray(value) ? [] : {};
  }
}
