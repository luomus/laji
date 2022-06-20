import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';

export class InfoCardQueryService {
  static getSpecimenQuery(taxonId: string, typeSpecimen?: boolean, collectionId?: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      collectionId: collectionId ? [collectionId] : undefined,
      superRecordBasis: ['PRESERVED_SPECIMEN'],
      sourceId: ['KE.3', 'KE.167'],
      // eslint-disable-next-line max-len
      collectionAndRecordQuality: 'PROFESSIONAL:EXPERT_VERIFIED,COMMUNITY_VERIFIED,NEUTRAL;HOBBYIST:EXPERT_VERIFIED,COMMUNITY_VERIFIED;AMATEUR:EXPERT_VERIFIED,COMMUNITY_VERIFIED;',
      typeSpecimen,
      includeNonValidTaxa: false,
      cache: true,
      needsCheck: false
    };
  }

  static getExpertVerifiedObservationQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      recordQuality: ['EXPERT_VERIFIED'],
      includeNonValidTaxa: false,
      cache: true
    };
  }

  static getReliableHumanObservationQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      superRecordBasis: ['HUMAN_OBSERVATION_UNSPECIFIED'],
      reliability: ['RELIABLE'],
      includeNonValidTaxa: false,
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

  static getFinnishObservationHabitatQuery(taxonId: string, mapQuery?: boolean): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      countryId: ['ML.206'],
      coordinateAccuracyMax: mapQuery ? 10000 : undefined,
      recordQuality: ['NEUTRAL', 'COMMUNITY_VERIFIED', 'EXPERT_VERIFIED'],
      unitFact: ['http://tun.fi/MY.habitatIUCN'],
      includeNonValidTaxa: false,
      cache: true
    };
  }
}
