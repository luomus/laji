import { NavigationEnd, Event } from '@angular/router';
import merge from 'deepmerge';
import { Document } from './model/Document';
import { PlatformService } from '../root/platform.service';

export type WithNonNullableKeys<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>;
};

type DeepOptionalKeys<T, OptionalKeys extends PropertyKey> =
  T extends Array<infer U>
    ? DeepOptionalKeys<U, OptionalKeys>[]
    : T extends object
      ? {
          [K in keyof T]?: K extends OptionalKeys
            ? T[K]
            : DeepOptionalKeys<T[K], OptionalKeys>;
        }
      : T;

export type Unsaved<T> = DeepOptionalKeys<T, '@context' | '@type' | 'id'>;

/**
 * Clones the object using JSON stringify
 * @returns any
 */
export const clone = (object: any) =>
  JSON.parse(JSON.stringify(object));

/**
 * Checks the equality of arrays
 * @returns boolean
 */
export const  equalsArray = (a1?: any[]|null, a2?: any[]|null) =>
  a1 && a2 && a1.length === a2.length && a1.every((value) => a2.includes(value));


/**
 * Return the elements that are missing from the another array
 */
export const arrayDiff = <T>(a1: T[], a2: T[]): T[] => {
  if (!Array.isArray(a1)) {
    return Array.isArray(a2) ? a2 : [];
  }
  if (!Array.isArray(a2)) {
    return a1;
  }
  return a1
    .filter(x => !a2.includes(x))
    .concat(a2.filter(x => !a1.includes(x)));
};

/**
 * Checks if the given value is empty object
 *
 * Values that are not objects are considered to be empty objects
 *
 * @returns boolean
 */
export const isEmptyObj = (value: any) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return true;
  }
  return Object.keys(value).length === 0;
};

/**
 * Remove undefined values from object and any key specified by the key parameter
 *
 * @param obj object to remove keys from
 * @param keys array of keys that should be removed
 */
export const removeFromObject = <T extends {[prop: string]: any}>(obj: T, keys?: string[]): Partial<T> => {
  if (typeof obj !== 'object') {
    return obj;
  }
  return Object.keys(obj).reduce<Partial<T>>((cumulative, current: keyof T) => {
    if (typeof obj[current] !== 'undefined' && (!keys || keys.indexOf(current as string) === -1)) {
      cumulative[current] = obj[current];
    }
    return cumulative;
  }, {} as Partial<T>);
};

/**
 * Remove all undefined and null values from object
 *
 * @param obj object to remove keys from
 */
export const withNonNullableValues = <T extends {[prop: string]: any}, K extends keyof T>(obj: T): WithNonNullableKeys<T, K> =>
  Object.keys(obj).reduce((cumulative, current: keyof T) => {
    if (obj[current] !== undefined && obj[current] !== null) {
      (cumulative as any)[current] = obj[current];
    }
    return cumulative;
  }, {} as WithNonNullableKeys<T, K>);

/**
 * Add leading zero so that the length of return string will be 2
 */
export const addLeadingZero =(val: string | number): string => {
  val = '' + val;
  if (val.length === 1) {
    return '0' + val;
  }
  return val;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const JSONPathToJSONPointer = (jsonPath: string): string => {
  let pathAsJSONPointer = jsonPath[0] === '$' ? jsonPath.substring(1, jsonPath.length) : jsonPath; // Remove first '$'
  pathAsJSONPointer = pathAsJSONPointer
    .replace(/\./g, '/')
    .replace(/\[/g, '/')
    .replace(/]/g, '/');
  if (pathAsJSONPointer[pathAsJSONPointer.length - 1] === '/') {
    pathAsJSONPointer = pathAsJSONPointer.substring(0, pathAsJSONPointer.length - 1);
  }
  return pathAsJSONPointer;
};

export const parseJSONPath = (object: any, jsonPath: string): any => parseJSONPointer(object, JSONPathToJSONPointer(jsonPath));

export const parseJSONPointer = (object: any, jsonPointer: string, create = false): any => {
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
};

export const updateWithJSONPointer = (object: any, jsonPointer: string, value: any): any => {
  const splits = jsonPointer.split('/');
  const last = splits.pop() as string;

  const lastContainerPointer = splits.join('/');
  const lastContainer = parseJSONPointer(object, lastContainerPointer, true);
  if (lastContainer) {
    lastContainer[last] = value;
  }
  return object;
};

export const arrayCombineMerge = (target: any[], source: any[], options: any) => {
  const destination = target.slice();

  source.forEach(function(e, i) {
    if (typeof destination[i] === 'undefined') {
      const cloneRequested = options.clone !== false;
      const shouldClone = cloneRequested && options.isMergeableObject(e);
      destination[i] = shouldClone ? mergeClone(e, options) : e;
    } else if (options.isMergeableObject(e)) {
      destination[i] = merge(target[i], e, options);
    } else if (target.indexOf(e) === -1) {
      destination.push(e);
    }
  });
  return destination;
};

export const eventIsNavigationEnd = (event: Event): event is NavigationEnd => event instanceof NavigationEnd;

export const isLocalNewestDocument = (local: Document, remote: Document): boolean => {
  if (remote && remote.dateEdited) {
    if (!local || !local.dateEdited ||
      new Date(local.dateEdited) < new Date(remote.dateEdited)) {
      return false;
    }
  }
  return true;
};

export const hasOwnProperty = <X extends Record<string, unknown>, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> => obj.hasOwnProperty(prop);

export const removeUndefinedFromObject = <T extends Record<string, unknown>>(obj: T): T => (Object.keys(obj) as (keyof T)[]).reduce((cumulative, current) => {
  if (typeof obj[current] !== 'undefined') {
    cumulative[current] = obj[current];
  }
  return cumulative;
}, {} as T);

export const isObject = (any: any): any is Record<string, unknown> => typeof any === 'object' && any !== null && !Array.isArray(any);

/**
 * @param platformService
 * @param tag can be used to track the event eg. if this event needs to be ignored by a specific listener. Should not be a key of the Event type!
 */
export const dispatchResizeEvent = (platformService: PlatformService, tag?: string) => {
  try {
    const event = new Event('resize');
    if (tag !== undefined) {
      (event as any)[tag] = true;
    }
    platformService.window.dispatchEvent(event);
  } catch (e) {
    try {
      const evt: any = platformService.window.document.createEvent('UIEvents');
      if (tag !== undefined) {
        (evt as any)[tag] = true;
      }
      evt.initUIEvent('resize', true, false, platformService.window, 0);
      platformService.window.dispatchEvent(evt);
    } catch (error) {}
  }
};

const mergeClone = (value: any, options: any) => merge(mergeEmptyTarget(value), value, options);

const mergeEmptyTarget = (value: any) => Array.isArray(value) ? [] : {};

export const dictionarify = <T extends string>(arr: readonly T[]): Record<T, true> =>
  arr.reduce((dict, item) => {
    dict[item] = true;
    return dict;
  }, {} as Record<T, true>);

export const dictionarifyByKey = <T>(objects: T[], key: keyof T) =>
  objects.reduce<Record<string, T>>((map, obj) => {
    map[obj[key] as string] = obj;
    return map;
  }, {});

