export const DEFAULT_DOMAIN = 'http://tun.fi/';


/**
 * Id service
 * Currently works only in default domain!
 */
export class IdService {
  static getId(value) {
    if (typeof value !== 'string' || value === '') {
      return value;
    }
    if (value.indexOf('http') === 0) {
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
    return DEFAULT_DOMAIN + value;
  }
}
