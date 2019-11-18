/* tslint:disable */
import { Identification } from './identification';
export interface Annotation {

  /**
   * instance of identification
   */
  identification?: Identification;

  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;

  /**
   * This field is automatically populated with the objects type and any user given value in here will be ignored!
   */
  '@type'?: string;

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
  annotationClass?: 'MAN.annotationClassReliable' | 'MAN.annotationClassLikely' | 'MAN.annotationClassNeutral' | 'MAN.annotationClassSuspicious' | 'MAN.annotationClassUnreliable' | 'MAN.annotationClassAcknowledged' | 'MAN.annotationClassSpam';
  censusAnnotation?: Array<string>;

  /**
   * dateTime string using ISO8601 format
   */
  created?: string;

  /**
   * Context for the given json
   */
  '@context'?: string;
  invasiveControlEffectiveness?: 'MY.invasiveControlEffectivenessFull' | 'MY.invasiveControlEffectivenessPartial' | 'MY.invasiveControlEffectivenessNone' | 'MY.invasiveControlEffectivenessNotFound';
  lineTransectAnnotation?: Array<string>;
  notes?: string;
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
  type: 'MAN.typeOpinion' | 'MAN.typeInvasiveControlEffectiveness' | 'MAN.typeUnidentifiable' | 'MAN.typeAdmin';
}
