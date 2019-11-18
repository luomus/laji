/* tslint:disable */
import { DwETL_UnitQuality } from './dw-etl_unit-quality';
import { DwETL_Annotation } from './dw-etl_annotation';
import { DwETL_Fact } from './dw-etl_fact';
import { DwETL_MediaObject } from './dw-etl_media-object';
import { DwETL_Sample } from './dw-etl_sample';
export interface DwETL_Unit {
  breedingSite?: boolean;
  unitId?: string;
  quality?: DwETL_UnitQuality;
  reportedTaxonConfidence?: 'SURE' | 'UNSURE' | 'SUBSPECIES_UNSURE';
  referencePublication?: string;
  abundanceString?: string;
  recordBasis?: 'PRESERVED_SPECIMEN' | 'LIVING_SPECIMEN' | 'FOSSIL_SPECIMEN' | 'SUBFOSSIL_SPECIMEN' | 'MICROBIAL_SPECIMEN' | 'HUMAN_OBSERVATION_UNSPECIFIED' | 'HUMAN_OBSERVATION_SEEN' | 'HUMAN_OBSERVATION_HEARD' | 'HUMAN_OBSERVATION_PHOTO' | 'HUMAN_OBSERVATION_INDIRECT' | 'HUMAN_OBSERVATION_HANDLED' | 'HUMAN_OBSERVATION_VIDEO' | 'HUMAN_OBSERVATION_RECORDED_AUDIO' | 'MACHINE_OBSERVATION_UNSPECIFIED' | 'MACHINE_OBSERVATION_VIDEO' | 'MACHINE_OBSERVATION_AUDIO' | 'MACHINE_OBSERVATION_GEOLOGGER' | 'MACHINE_OBSERVATION_SATELLITE_TRANSMITTER' | 'LITERATURE';
  typeSpecimen?: boolean;
  det?: string;
  sex?: 'MALE' | 'FEMALE' | 'WORKER' | 'UNKNOWN' | 'NOT_APPLICABLE' | 'GYNANDROMORPH' | 'MULTIPLE' | 'CONFLICTING';
  lifeStage?: 'ADULT' | 'JUVENILE' | 'IMMATURE' | 'EGG' | 'TADPOLE' | 'PUPA' | 'NYMPH' | 'SUBIMAGO' | 'LARVA' | 'SNAG' | 'EMBRYO' | 'SUBADULT' | 'MATURE' | 'STERILE' | 'FERTILE' | 'SPROUT' | 'DEAD_SPROUT' | 'BUD' | 'FLOWER' | 'WITHERED_FLOWER' | 'SEED' | 'RIPENING_FRUIT' | 'RIPE_FRUIT' | 'SUBTERRANEAN';
  wild?: boolean;
  keywords?: Array<string>;
  taxonVerbatim?: string;
  individualId?: string;
  invasiveControlEffectiveness?: 'FULL' | 'PARTIAL' | 'NO_EFFECT' | 'NOT_FOUND';
  notes?: string;
  annotations?: Array<DwETL_Annotation>;
  author?: string;
  facts?: Array<DwETL_Fact>;
  individualCountFemale?: number;
  individualCountMale?: number;
  media?: Array<DwETL_MediaObject>;
  reportedInformalTaxonGroup?: string;
  reportedTaxonId?: string;
  samples?: Array<DwETL_Sample>;
}
