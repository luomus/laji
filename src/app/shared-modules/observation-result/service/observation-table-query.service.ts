import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

export class ObservationTableQueryService {

  static fieldsToQuery(fields: string[], data: any, query: WarehouseQueryInterface = {}) {
    fields.map(key => {
      try {
        if (key === 'unit.taxon') {
          if (data.unit.linkings && data.unit.linkings.taxon && data.unit.linkings.taxon.id) {
            query.taxonId = data.unit.linkings.taxon.id;
          } else if (data.unit.taxonVerbatim) {
            query.target = data.unit.taxonVerbatim;
          }
        }
        if (key === 'unit.taxonVerbatim' && data.unit.taxonVerbatim) {
          query.target = data.unit.taxonVerbatim;
        }
        if (key === 'unit.linkings.taxon' && data.unit.linkings.taxon.id) {
          query.taxonId = data.unit.linkings.taxon.id;
        }
        if (key === 'unit.linkings.taxon.vernacularName' && data.unit.linkings.taxon.id) {
          query.taxonId = data.unit.linkings.taxon.id;
        }
        if (key === 'unit.linkings.taxon.scientificName' && data.unit.linkings.taxon.id) {
          query.taxonId = data.unit.linkings.taxon.id;
        }
        if (key === 'document.collectionId' && data.document.collectionId ) {
          query.collectionId = data.document.collectionId;
        }
        if (key === 'document.sourceId' && data.document.sourceId ) {
          query.sourceId = data.document.sourceId;
        }
        if (key === 'unit.superRecordBasis' && data.unit.superRecordBasis ) {
          query.superRecordBasis = data.unit.superRecordBasis;
        }
        if (key === 'unit.media.mediaType' && data.unit.media.mediaType) {
          query.hasUnitMedia = data.unit.media.mediaType === 'IMAGE';
        }
      } catch (e) {console.log(e)}
    });
    return query;
  }

}
