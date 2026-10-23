import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';

export class InfoCardQueryService {
  static getSpecimenQuery(taxonId: string, typeSpecimen?: boolean, collectionId?: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      collectionId: collectionId ? [collectionId] : undefined,
      superRecordBasis: ['PRESERVED_SPECIMEN'],
      sourceId: ['KE.3', 'KE.167'],
      // eslint-disable-next-line max-len
      collectionQuality: ['PROFESSIONAL'],
      typeSpecimen,
      cache: true,
      needsCheck: false
    };
  }

  static getExpertVerifiedObservationQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      superRecordBasis: ['HUMAN_OBSERVATION_UNSPECIFIED'],
      recordQuality: ['EXPERT_VERIFIED'],
      cache: true
    };
  }

  static getFinnishObservationQuery(taxonId: string, mapQuery?: boolean): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      countryId: ['ML.206'],
      coordinateAccuracyMax: mapQuery ? 10000 : undefined,
      recordQuality: ['EXPERT_VERIFIED', 'COMMUNITY_VERIFIED', 'NEUTRAL'],
      needsCheck: false,
      includeNonValidTaxa: false,
      cache: true
    };
  }
}
