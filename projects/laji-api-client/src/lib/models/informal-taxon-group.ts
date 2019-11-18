/* tslint:disable */
export interface InformalTaxonGroup {
  id: string;

  /**
   * If this is true, the group is considered a root even if it has parents. For example Fishes is part of Water animals but still is wanted to be a root by itself.
   */
  explicitlyDefinedRoot?: boolean;
  hasSubGroup?: Array<string>;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  name?: string;
}
