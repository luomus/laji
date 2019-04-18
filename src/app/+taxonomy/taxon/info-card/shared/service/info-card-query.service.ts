import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';

export class InfoCardQueryService {
  static getSpecimenQuery(taxonId: string, typeSpecimen?: boolean, collectionId?: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      collectionId: collectionId ? [collectionId] : undefined,
      superRecordBasis: ['PRESERVED_SPECIMEN'],
      sourceId: ['KE.3', 'KE.167'],
      typeSpecimen: typeSpecimen,
      cache: true
    };
  }

  static getReliableHumanObservationQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      superRecordBasis: ['HUMAN_OBSERVATION_UNSPECIFIED'],
      taxonReliability: ['RELIABLE'],
      cache: true
    };
  }

  static getFinnishObservationQuery(taxonId: string, mapQuery?: boolean): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      countryId: ['ML.206'],
      coordinateAccuracyMax: mapQuery ? 10000 : undefined,
      taxonReliability: ['NEUTRAL', 'LIKELY', 'RELIABLE'],
      cache: true
    };
  }
}
