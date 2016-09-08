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
}
