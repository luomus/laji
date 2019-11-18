/* tslint:disable */
import { MultiLanguage } from './multi-language';
import { LajiInformalGroup } from './laji-informal-group';
export interface LajiTaxonSearch {

  /**
   * Author
   */
  scientificNameAuthorship?: string;

  /**
   * Unique identifier for the taxon
   */
  id: string;

  /**
   * Name that the search matches to
   */
  matchingName: string;

  /**
   * Type of the name
   */
  nameType?: string;

  /**
   * Scientific name for the match
   */
  scientificName?: string;

  /**
   * Name of the informal group
   */
  vernacularName?: MultiLanguage;

  /**
   * What kind of match this is
   */
  type: string;

  /**
   * Taxon rank
   */
  taxonRank?: string;

  /**
   * Score for the match
   */
  similarity?: string;

  /**
   * Is finnish taxa
   */
  finnish?: boolean;

  /**
   * Is taxon rank species
   */
  species?: boolean;

  /**
   * Should scientific name be cursive
   */
  cursiveName?: boolean;

  /**
   * Informal group
   */
  informalGroup?: Array<LajiInformalGroup>;
}
