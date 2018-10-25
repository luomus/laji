import { Injectable } from '@angular/core';

type FilterBaseType = number|boolean|string;
export type FilterByType = FilterBaseType|{by: FilterBaseType, properties: string[]};

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  /**
   * Filters the given value
   * @param value array of values
   * @param filterBy
   */
  filter(value: any, filterBy: FilterByType): any {
    if (!Array.isArray(value) || !filterBy) {
      return value;
    }
    const needle = typeof filterBy === 'object' ? filterBy.by : filterBy;
    const properties = typeof filterBy === 'object' ? filterBy.properties : null;
    return value.filter(val => this.contains(needle, val, properties));
  }

  /**
   * Checks whether the needle is found from the haystack
   * @param needle
   * @param haystack
   * @param properties
   */
  private contains(needle: FilterBaseType, haystack: any, properties: string[]) {
    switch (typeof haystack) {
      case 'string':
        return haystack.indexOf(needle) > -1;
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
