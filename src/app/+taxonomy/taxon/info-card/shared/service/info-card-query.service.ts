import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';

export class InfoCardQueryService {
  static getSpecimenQuery(taxonId: string, typeSpecimen?: boolean, collectionId?: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      collectionId: collectionId ? [collectionId] : undefined,
      superRecordBasis: ['PRESERVED_SPECIMEN'],
      sourceId: ['KE.3', 'KE.167'],
      typeSpecimen: typeSpecimen,
      includeNonValidTaxa: false,
      recordQuality: ['COMMUNITY_VERIFIED', 'EXPERT_VERIFIED', 'NEUTRAL'],
      cache: true
    };
  }

  static getReliableHumanObservationQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      superRecordBasis: ['HUMAN_OBSERVATION_UNSPECIFIED'],
      recordQuality: ['EXPERT_VERIFIED', 'COMMUNITY_VERIFIED'],
      includeNonValidTaxa: false,
      cache: true
    };
  }

  static getFinnishObservationQuery(taxonId: string, mapQuery?: boolean): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      countryId: ['ML.206'],
      coordinateAccuracyMax: mapQuery ? 10000 : undefined,
      reliability: ['RELIABLE', 'UNDEFINED'],
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
