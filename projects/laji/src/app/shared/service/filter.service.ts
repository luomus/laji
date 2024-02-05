import { Injectable } from '@angular/core';

export type FilterBaseType = number | boolean | string;
export interface SearchRecordQuery<T, K> { by: T; properties: K };
export type FilterByType<
  T extends FilterBaseType = FilterBaseType,
  K extends string[] = string[]
> = T | SearchRecordQuery<T, K>;
export type SearchRecord<K extends string[]> = { [P in K[number]]? } & Record<string, any>;

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  /**
   * Filters the given value
   * @param arr array of values
   * @param filterBy filter by these values
   * @param matching if true returns matching if false returns those not matching
   */
  filter<
    T extends FilterBaseType,
    K extends string[],
    S extends SearchRecord<K>,
    Element extends T | S
  >(
    arr: Element[], filterBy: FilterByType<T, K>, matching = true
  ): Element[] {
    if (!Array.isArray(arr)) {
      return [arr];
    }
    if (!filterBy && typeof filterBy !== 'boolean') {
      return arr;
    }

    let needle: T;
    let properties: K | undefined;
    switch (typeof filterBy) {
      case 'object':
        needle = filterBy.by;
        if (!needle) {
          return arr;
        }
        properties = filterBy.properties;
        break;
      case 'string':
        needle = <T>(filterBy as string).toLocaleLowerCase();
        break;
      default:
        needle = filterBy;
        break;
    }

    return arr.filter(val => {
      const contains = this.contains(needle as FilterBaseType, val, properties);

      return matching ? contains : !contains;
    });
  }

  /**
   * Checks whether the needle is found from the haystack
   * @param needle search for this value
   * @param haystack search from these values
   * @param properties check for match only from these properties
   */
  private contains<
    HaystackObj extends Record<HaystackKey, HaystackValue>,
    HaystackKey extends string,
    HaystackValue extends FilterBaseType
  >(
    needle: HaystackValue, haystack: HaystackValue | HaystackObj, properties: HaystackKey[]
  ) {
    switch (typeof haystack) {
      case 'string':
        return haystack.toLocaleLowerCase().indexOf((needle as string).toLocaleLowerCase()) > -1;
      case 'number':
        return haystack === needle;
      case 'boolean':
        return haystack === needle;
      case 'object':
        return this.objectContains(needle, haystack, properties || Object.keys(haystack));
      default:
        return false;
    }
  }

  private objectContains<T extends FilterBaseType, U extends string, V extends Record<U, T>>(
    needle: T, obj: V, properties: U[]
  ): boolean {
    for (const i of properties) {
      if (typeof obj[i] === 'undefined') {
        continue;
      }
      if (this.contains(needle, obj[i], properties)) {
        return true;
      }
    }
    return false;
  }
}
