/* eslint-disable max-len */
/**
 * API documentation
 * Access token is needed to use this API. To get a token, send a POST request with your email address to /api-users endpoint and one will be send to your. Each endpoint bellow has more information on how to use this API. If you have any questions you can contact us at helpdesk@laji.fi.  You can find more documentation [here](https://laji.fi/about/806).  ##Endpoints  Observations and collections * Warehouse - Observation Data Warehouse API * Collection - Collection metadata * Source - Information sources (IT systems) * Annotation - Quality control   Taxonomy * Taxa - Taxonomy API * InformalTaxonGroup - Informal taxon groups are used in taxa and warehouse endpoints * Publication - Scientific publications * Checklist - Mainly you only work with one checklits: the FinBIF master checklist. There are others.   Other master data * Metadata - Variable descriptions * Area - Countries, municipalities and biogeographical provinces of Finland, etc. * Person - Information about people.   Helpers * APIUser - Register as an API user * Autocomplete - For making an autocomplete filed for taxa, collections or persons (friends) * PersonToken - Information about an authorized person   Vihko observation system * Form - Form definition * Document - Document instance of a form * Image - Image of a document   Laji.fi portal * Feedback - Feedback form API * Information - CMS content of information pages * Logger - Error logging from user's browsers to FinBIF * News - News
 *
 * OpenAPI spec version: 0.1
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { Identification } from './identification';


export interface Annotation {
  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;
  /**
   * Context for the given json
   */
  context?: string;

  /**
   * QName for MMAN.tagClass
   */
  addedTags?: Array<string>;
  /**
   * QName for MA.person
   */
  annotationByPerson?: string;
  /**
   * QName for KE.informationSystem
   */
  annotationBySystem?: string;
  byRole?: Annotation.RoleEnum;
  censusAnnotation?: Array<string>;
  /**
   * dateTime string using ISO8601 format
   */
  created?: string;
  /**
   * instance of identification
   */
  identification?: Identification;
  invasiveControlEffectiveness?: Annotation.InvasiveControlEffectivenessEnum;
  lineTransectAnnotation?: Array<string>;
  notes?: string;
  occurrenceAtTimeOfAnnotation?: string;
  opinion?: string;
  /**
   * QName for MMAN.tagClass
   */
  removedTags?: Array<string>;
  /**
   * QName for MY.document
   */
  rootID?: string;
  /**
   * QName for MY.unit
   */
  targetID?: string;
  type: Annotation.TypeEnum;
}

export namespace Annotation {
  export type RoleEnum = 'MMAN.expert' | 'MMAN.basic' | 'MMAN.owner';
  export const RoleEnum = {
    Expert: 'MMAN.expert' as RoleEnum,
    Basic: 'MMAN.basic' as RoleEnum,
    Owner: 'MMAN.owner' as RoleEnum
  };
  export type InvasiveControlEffectivenessEnum =
    'MY.invasiveControlEffectivenessFull'
    | 'MY.invasiveControlEffectivenessPartial'
    | 'MY.invasiveControlEffectivenessNone'
    | 'MY.invasiveControlEffectivenessNotFound';
  export const InvasiveControlEffectivenessEnum = {
    InvasiveControlEffectivenessFull: 'MY.invasiveControlEffectivenessFull' as InvasiveControlEffectivenessEnum,
    InvasiveControlEffectivenessPartial: 'MY.invasiveControlEffectivenessPartial' as InvasiveControlEffectivenessEnum,
    InvasiveControlEffectivenessNone: 'MY.invasiveControlEffectivenessNone' as InvasiveControlEffectivenessEnum,
    InvasiveControlEffectivenessNotFound: 'MY.invasiveControlEffectivenessNotFound' as InvasiveControlEffectivenessEnum
  };
  export type TypeEnum = 'MAN.typeOpinion' | 'MAN.typeInvasiveControlEffectiveness' | 'MAN.typeUnidentifiable' | 'MAN.typeAdmin';
  export const TypeEnum = {
    TypeOpinion: 'MAN.typeOpinion' as TypeEnum,
    TypeInvasiveControlEffectiveness: 'MAN.typeInvasiveControlEffectiveness' as TypeEnum,
    TypeUnidentifiable: 'MAN.typeUnidentifiable' as TypeEnum,
    TypeAdmin: 'MAN.typeAdmin' as TypeEnum
  };
}
