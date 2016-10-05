export class CoordinateService {
  public static getWarehouseQuery(coordinates: Array<Array<Array<number>>>) {
    if (!coordinates || !coordinates[0] || !coordinates[0][2] || !coordinates[0][2][1]) {
      return '';
    }
    return [
        coordinates[0][0][1],
        coordinates[0][2][1],
        coordinates[0][0][0],
        coordinates[0][2][0]
      ].join(':') + ':WGS84';
  }
}
