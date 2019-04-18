import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';

export class InfoCardQueryService {
  static getSpecimenQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      superRecordBasis: ['PRESERVED_SPECIMEN'],
      sourceId: ['KE.3', 'KE.167'],
      cache: true
    };
  }

  static getTypeSpecimenQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      superRecordBasis: ['PRESERVED_SPECIMEN'],
      sourceId: ['KE.3', 'KE.167'],
      typeSpecimen: true,
      cache: true
    };
  }

  static getCollectionSpecimenQuery(taxonId: string, collectionId?: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      collectionId: collectionId ? [collectionId] : undefined,
      superRecordBasis: ['PRESERVED_SPECIMEN'],
      sourceId: ['KE.3', 'KE.167'],
      typeSpecimen: false,
      cache: true
    };
  }

  static getReliableObservationQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      superRecordBasis: ['HUMAN_OBSERVATION_UNSPECIFIED'],
      taxonReliability: ['RELIABLE'],
      cache: true
    };
  }

  static getMapObservationQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      countryId: ['ML.206'],
      coordinateAccuracyMax: 10000,
      taxonReliability: ['NEUTRAL', 'LIKELY', 'RELIABLE'],
      cache: true
    };
  }

  static getChartObservationQuery(taxonId: string): WarehouseQueryInterface {
    return {
      taxonId: [taxonId],
      countryId: ['ML.206'],
      taxonReliability: ['NEUTRAL', 'LIKELY', 'RELIABLE'],
      cache: true
    };
  }
}
