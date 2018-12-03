import { Injectable } from '@angular/core';

type FilterBaseType = number|boolean|string;

interface FilterObjType {by: FilterBaseType; properties: string[]; }

export type FilterByType = FilterBaseType|FilterObjType;

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  /**
   * Filters the given value
   * @param value array of values
   * @param filterBy filter by these values
   */
  filter(value: any, filterBy: FilterByType): any {
    if (!Array.isArray(value) || !filterBy) {
      return value;
    }
    let needle = filterBy;
    let properties = null;
    switch (typeof filterBy) {
      case 'object':
        needle = (filterBy as FilterObjType).by;
        properties = (filterBy as FilterObjType).properties;
        break;
      case 'string':
        needle = (needle as string).toLocaleLowerCase();
        break;
    }
    return value.filter(val => this.contains(needle as FilterBaseType, val, properties));
  }

  /**
   * Checks whether the needle is found from the haystack
   * @param needle search for this value
   * @param haystack search from these values
   * @param properties check for match only from these properties
   */
  private contains(needle: FilterBaseType, haystack: any, properties: string[]) {
    switch (typeof haystack) {
      case 'string':
        return haystack.toLocaleLowerCase().indexOf(needle as string) > -1;
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

  private objectContains(needle: FilterBaseType, obj: object, properties: string[]): boolean {
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
