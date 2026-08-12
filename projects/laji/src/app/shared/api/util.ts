import { WarehouseQueryInterface } from '../model/WarehouseQueryInterface';

export const isEmptyWarehouseQuery = (query: WarehouseQueryInterface = {}) => {
  const keys = Object.keys(query);
  for (const key of keys) {
    if (typeof (query as any)[key] === 'undefined') {
      continue;
    } else if (key === 'countryId') {
      if ((query as any).countryId.length === 0 || ((query as any).countryId.length === 1 && (query as any).countryId.indexOf('ML.206') > -1)) {
        continue;
      }
      return false;
    } else if (['includeNonValidTaxa', 'cache'].indexOf(key) > -1 || key.charAt(0) === '_') {
      continue;
    }
    return false;
  }
  return true;
};
