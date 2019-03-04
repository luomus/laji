import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WarehouseApi } from '../../api/WarehouseApi';
import { WarehouseQueryInterface } from '../../model/WarehouseQueryInterface';
import {PagedResult} from '../../model/PagedResult';


@Injectable({providedIn: 'root'})
export class GalleryService {
  constructor(private warehouseApi: WarehouseApi) {
  }

  getList(query: WarehouseQueryInterface, sort: string[], pageSize: number, page: number): Observable<PagedResult<any>> {
    if (WarehouseApi.isEmptyQuery(query)) {
      query.cache = true;
    }

    // TODO: think about this little more units are still basic search for this so might have to drop this
    // or target gathering and document endpoints
    const imgField = 'media';
    query.hasUnitMedia = true;
    /*
    if (query.hasUnitMedia) {
      // pass
    } else if (query.hasGatheringMedia) {
      imgField = 'gathering.media';
    } else if (query.hasDocumentMedia) {
      imgField = 'document.media';
    } else {
      query.hasUnitMedia = true;
    }
    */
    return this.warehouseApi.warehouseQueryUnitMediaListGet(query, [
      'unit.taxonVerbatim,unit.linkings.taxon.id,unit.linkings.taxon.vernacularName,' +
      'unit.linkings.taxon.scientificName,unit.reportedInformalTaxonGroup',
      imgField,
      // 'gathering.media',
      // 'document.media',
      'document.documentId,unit.unitId',
      ''
    ], sort, pageSize, page);
  }

  getImages(list: PagedResult<any>, limit = 1000): any[] {
    const imgField = 'media';
    const images = [];
    if (list.results) {
      list.results.map(items => {
        const group = (items['unit'] && items['unit']['reportedInformalTaxonGroup']) ? items['unit']['reportedInformalTaxonGroup'] : '';
        const verbatim = (items['unit'] && items['unit']['taxonVerbatim']) ? items['unit']['taxonVerbatim'] : '';

        if (images.length >= limit) {
          return images;
        }
        const media = items.media;
        media['documentId'] = items['document']['documentId'];
        media['unitId'] = items['unit']['unitId'];
        if (imgField === 'media') {
          media['taxonId'] = items.unit
            && items.unit.linkings
            && items.unit.linkings.taxon
            && items.unit.linkings.taxon.id || '';
          media['vernacularName'] = items.unit
            && items.unit.linkings
            && items.unit.linkings.taxon
            && items.unit.linkings.taxon.vernacularName || '';
          media['scientificName'] = items['unit']
            && items['unit']['linkings']
            && items['unit']['linkings']['taxon']
            && items['unit']['linkings']['taxon']['scientificName'] || verbatim || group || '';
        }
        images.push(media);
      });
    }
    return images;
  }
}
