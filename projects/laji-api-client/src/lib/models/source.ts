/* tslint:disable */
export interface Source {
  id: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  name?: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  description?: string;
}
