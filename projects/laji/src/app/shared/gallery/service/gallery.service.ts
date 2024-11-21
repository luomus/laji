import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WarehouseApi } from '../../api/WarehouseApi';
import { WarehouseQueryInterface } from '../../model/WarehouseQueryInterface';
import { PagedResult } from '../../model/PagedResult';
import { Image } from '../image-gallery/image.interface';
import { IdService } from '../../service/id.service';


@Injectable({providedIn: 'root'})
export class GalleryService {
  constructor(private warehouseApi: WarehouseApi) {
  }

  getList(rawQuery: WarehouseQueryInterface, sort: string[], pageSize: number, page: number): Observable<PagedResult<any>> {
    const query = {...rawQuery};
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

  getImages(list: PagedResult<any>, limit = 1000): Image[] {
    const imgField = 'media';
    const images: any[] = [];
    list.results?.forEach(items => {
      const group = (items['unit'] && items['unit']['reportedInformalTaxonGroup']) ? items['unit']['reportedInformalTaxonGroup'] : '';
      const verbatim = (items['unit'] && items['unit']['taxonVerbatim']) ? items['unit']['taxonVerbatim'] : '';

      if (images.length >= limit) {
        return;
      }
      const media = items.media;
      media['documentId'] = items['document']['documentId'];
      media['unitId'] = items['unit']['unitId'];
      if (imgField === 'media') {
        media['taxonId'] = IdService.getId(items.unit
          && items.unit.linkings
          && items.unit.linkings.taxon
          && items.unit.linkings.taxon.id || '');
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
    return images;
  }
}
