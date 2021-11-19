import { Injectable } from '@angular/core';

export const DEFAULT_DOMAIN = 'http://tun.fi/';


/**
 * Id service
 * Currently works only in default domain!
 */
@Injectable()
export class IdService {

  static readonly domainMap: Record<string, string> = {
    'luomus:': 'http://id.luomus.fi/',
    'zmuo:': 'http://id.zmuo.oulu.fi/',
    'herbo:': 'http://id.herb.oulu.fi/',
    'utu:': 'http://mus.utu.fi/',
    'gbif-dataset:': 'https://www.gbif.org/dataset/',
  };

  static getId(value: any) {
    if (typeof value !== 'string' || value === '') {
      return value;
    } else if (value.indexOf(DEFAULT_DOMAIN) === 0) {
      return value.replace(DEFAULT_DOMAIN, '');
    } else if (value.indexOf('http') === 0) {
      Object.keys(IdService.domainMap).map(prefix => {
        value = value.replace(IdService.domainMap[prefix], prefix);
      });
    }
    return value;
  }

  static getUri(value: any) {
    if (typeof value !== 'string' || value === '') {
      return value;
    }
    if (value.indexOf('http') === 0) {
      return value;
    }
    Object.keys(IdService.domainMap).map(
      (prefix) => value = value.replace(prefix, IdService.domainMap[prefix])
    );
    if (value.indexOf('http') === 0) {
      return value;
    }
    return DEFAULT_DOMAIN + value;
  }
}
