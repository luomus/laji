import { Injectable } from '@angular/core';
import { Document } from '../../../shared/model/Document';

/**
 * Document service
 */
@Injectable()
export class DocumentInfoService {
  static getGatheringInfo(document: Document, form: any) {
    const info = {
      dateBegin: null,
      dateEnd: null,
      unsavedUnitCount: 0,
      locality: null,
      localityCount: 0,
      unitList: []
    };

    if (!document.gatherings || !Array.isArray(document.gatherings)) {
      return info;
    }

    for (let i = 0; i < document.gatherings.length; i++) {
      const gathering = document.gatherings[i];
      if (i === 0) {
        info.locality = gathering.locality;
        info.localityCount = document.gatherings.length - 1;
      }
      DocumentInfoService.updateMinMaxDates(info, gathering.dateBegin);
      DocumentInfoService.updateMinMaxDates(info, gathering.dateEnd);

      if (gathering.units) {
        gathering.units.reduce((result, unit) => {
          if (this.isEmptyUnit(unit, form)) { return result; }

          let taxon = unit.informalNameString || '';
          if (unit.identifications && Array.isArray(unit.identifications)) {
            taxon = unit.identifications.reduce(
              (acc, cur) => {
                const curTaxon = cur.taxon || cur.taxonVerbatim || cur.taxonID;
                return acc ? acc + ', ' + curTaxon : curTaxon;
              }, taxon);
          }
          if (!unit.id) {
            info.unsavedUnitCount++;
          }
          result.push(taxon);
          return result;
        }, info.unitList);
      }
    }

    if (document['gatheringEvent']) {
      const event = document['gatheringEvent'];
      DocumentInfoService.updateMinMaxDates(info, event.dateBegin);
      DocumentInfoService.updateMinMaxDates(info, event.dateEnd);
    }

    return info;
  }

  private static updateMinMaxDates(info: any, newDate?: string) {
    if (!newDate) { return; }

    if (!info.dateBegin || new Date(newDate) < new Date(info.dateBegin)) {
      info.dateBegin = newDate;
    }

    if (!info.dateEnd || new Date(newDate) > new Date(info.dateEnd)) {
      info.dateEnd = newDate;
    }
  }

  public static isEmptyUnit(unit, form: any) {
    if (form.features && (
        form.features.indexOf('MHL.featurePrepopulateWithInformalTaxonGroups') !== -1 ||
        form.features.indexOf('MHL.featureEmptyOnNoCount') !== -1
      )
    ) {
      return !(unit.count || unit.individualCount || unit.pairCount || unit.abundanceString);
    }

    if (unit.identifications) {
      for (let j = 0; j < unit.identifications.length; j++) {
        const ident = unit.identifications[j];

        if (unit.informalNameString || ident.taxon || ident.taxonID || ident.taxonVerbatim) {
          return false;
        }
      }
    }

    return true;
  }
}
