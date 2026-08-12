import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WarehouseQueryInterface } from '../../model/WarehouseQueryInterface';
import { PagedResult } from '../../model/PagedResult';
import { Image } from '../image-gallery/image.interface';
import { IdService } from '../../service/id.service';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { paths } from 'projects/laji-api-client/generated/api';

type MediaListQuery = paths['/warehouse/query/unitMedia/list']['get']['parameters']['query'];

@Injectable({providedIn: 'root'})
export class GalleryService {
  constructor(private api: LajiApiClientService) {}

  getList(rawQuery: WarehouseQueryInterface, sort: string[] | undefined, pageSize: number, page: number): Observable<PagedResult<any>> {
    const query: MediaListQuery = {
      ...rawQuery as any,
      hasUnitMedia: true,
      selected: [
        'unit.taxonVerbatim,unit.linkings.taxon.id,unit.linkings.taxon.vernacularName,'
          + 'unit.linkings.taxon.scientificName,unit.reportedInformalTaxonGroup',
        'media',
        'document.documentId,unit.unitId',
      ],
      orderBy: sort,
      pageSize,
      page
    };

    // TODO: think about this little more units are still basic search for this so might have to drop this
    // or target gathering and document endpoints
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

    return this.api.get('/warehouse/query/unitMedia/list', { query });
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
