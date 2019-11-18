/* tslint:disable */
import { AcceptedDocument } from './accepted-document';
import { Active } from './active';
import { PrepopulatedDocument } from './prepopulated-document';
import { Reserve } from './reserve';
export interface NamedPlace {
  locality?: string;

  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;

  /**
   * This field is automatically populated with the objects type and any user given value in here will be ignored!
   */
  '@type'?: string;

  /**
   * instance of acceptedDocument
   */
  acceptedDocument?: AcceptedDocument;
  accessibility?: 'MNP.accessibilityEasy' | 'MNP.accessibilityModerate' | 'MNP.accessibilityDifficult';

  /**
   * instance of active
   */
  active?: Active;
  alternativeIDs?: Array<string>;

  /**
   * Formal abbreviation. For Finnish eliömaakunnat, use Finnish abbreviation.. QName for ML.area
   */
  biogeographicalProvince?: Array<string>;

  /**
   * QName for ML.area
   */
  birdAssociationArea?: Array<string>;

  /**
   * QName for MY.collection
   */
  collectionID?: string;

  /**
   * Persons who have rights to see and use the named places in their documents. QName for MA.person
   */
  editors?: Array<string>;

  /**
   * Using GeoJSONs geometry object specification. QName for MZ.geometry
   */
  geometry: string;

  /**
   * QName for MM.image
   */
  images?: Array<string>;

  /**
   * Context for the given json
   */
  '@context'?: string;

  /**
   * Informal description of the exact locality, e.g. '5 km NE of city X, under stone bridge'
   */
  localityDescription?: string;

  /**
   * QName for ML.area
   */
  municipality?: Array<string>;
  name: string;
  notes?: string;

  /**
   * Persons who have full use access and rights to edit the named place. QName for MA.person
   */
  owners?: Array<string>;

  /**
   * instance of prepopulatedDocument
   */
  prepopulatedDocument?: PrepopulatedDocument;
  priority?: 'MNP.priority1' | 'MNP.priority2' | 'MNP.priority3' | 'MNP.priority4' | 'MNP.priority5';
  privateNotes?: string;

  /**
   * Is the named place publicaly available. (Defaults to false)
   */
  public?: boolean;

  /**
   * instance of reserve
   */
  reserve?: Reserve;
  tags?: Array<string>;

  /**
   * QName for MX.taxon
   */
  taxonIDs?: Array<string>;
}
