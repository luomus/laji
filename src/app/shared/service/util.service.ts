export class Util {
  /**
   * Clones the object using JSON stringify
   * @param object
   * @returns {any}
   */
  public static clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  /**
   * Checks the equality using JSON stringify
   * @param o1
   * @param o2
   * @returns {boolean}
   */
  public static equals(o1, o2) {
    return JSON.stringify(o1) === JSON.stringify(o2);
  }

  /**
   * Checks if the given value is empty object
   *
   * Values that are not objects are considered to be empty objects
   *
   * @param value
   * @returns {boolean}
   */
  public static isEmptyObj(value: any) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return true;
    }
    return Object.keys(value).length === 0
  }
}
