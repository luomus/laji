import { Injectable } from '@angular/core';
export const DEFAULT_DOMAIN = 'http://tun.fi/';


/**
 * Id service
 * Currently works only in default domain!
 */
@Injectable()
export class IdService {

  static readonly domainMap = {
    'luomus:': 'http://id.luomus.fi/',
    'zmuo:': 'http://id.zmuo.oulu.fi/',
    'herbo:': 'http://id.herb.oulu.fi/',
    'utu:': 'http://mus.utu.fi/'
  };

  static getId(value) {
    if (typeof value !== 'string' || value === '') {
      return value;
    }
    if (value.indexOf('http') === 0) {
      Object.keys(IdService.domainMap).map(prefix => {
        value = value.replace(IdService.domainMap[prefix], prefix);
      });
      return value.replace(DEFAULT_DOMAIN, '');
    }
    return value;
  }

  static getUri(value) {
    if (typeof value !== 'string' || value === '') {
      return value;
    }
    if (value.indexOf('http') === 0) {
      return value;
    }
    Object.keys(IdService.domainMap).map(prefix => value = value.replace(prefix, IdService.domainMap[prefix]));
    if (value.indexOf('http') === 0) {
      return value;
    }
    return DEFAULT_DOMAIN + value;
  }
}
