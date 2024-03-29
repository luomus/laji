/**
 * OpenAPI spec version: 0.1
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { Document } from './Document';
import { Reserve } from './Reserve';
import { Active } from './Active';

export interface NamedPlace {
    /**
     * Unique ID for the object. This will be automatically generated.
     */
    id: string;

    accessibility?: NamedPlace.AccessibilityEnum;

    /**
     * instance of active
     */
    active?: Active;

    alternativeIDs?: Array<string>;

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
    geometry?: GeoJSON.Geometry;

    /**
     * QName for ML.area
     */
    municipality?: Array<string>;

    name?: string;

    notes?: string;

    /**
     * Persons who have full use access and rights to edit the named place. QName for MA.person
     */
    owners?: Array<string>;

    /**
     * instance of prepopulatedDocument
     */
    prepopulatedDocument?: Document;
    acceptedDocument?: Document;

    priority?: NamedPlace.PriorityEnum;

    privateNotes?: string;

    /**
     * Is the named place publicaly available. (Defaults to false)
     */
    public?: boolean;

    /**
     * instance of reserve
     */
    reserve?: Reserve;

    /**
     * QName for MX.taxon
     */
    taxonIDs?: Array<string>;

}
export namespace NamedPlace {
    export enum AccessibilityEnum {
        AccessibilityEasy = <any> 'MNP.accessibilityEasy',
        AccessibilityModerate = <any> 'MNP.accessibilityModerate',
        AccessibilityDifficult = <any> 'MNP.accessibilityDifficult'
    }
    export enum PriorityEnum {
        Priority1 = <any> 'MNP.priority1',
        Priority2 = <any> 'MNP.priority2',
        Priority3 = <any> 'MNP.priority3',
        Priority4 = <any> 'MNP.priority4',
        Priority5 = <any> 'MNP.priority5'
    }
}
