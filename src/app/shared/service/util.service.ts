export class Util {
  public static clone(object) {
    return JSON.parse(JSON.stringify(object));
  }
}
