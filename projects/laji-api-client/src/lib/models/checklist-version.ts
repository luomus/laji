/* tslint:disable */
export interface ChecklistVersion {
  id: string;
  versionChecklist?: string;
  versionDate?: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  versionDescription?: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  versionName?: string;
}
