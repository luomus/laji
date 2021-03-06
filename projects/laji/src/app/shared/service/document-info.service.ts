import { Injectable } from '@angular/core';
import { Document } from '../model/Document';
import { Units } from '../model/Units';
import { Global } from '../../../environments/global';
import { Form } from '../model/Form';

/**
 * Document Info service
 */
@Injectable({providedIn: 'root'})
export class DocumentInfoService {
  static getGatheringInfo(document: Document, form: Form.List) {
    const info = {
      dateBegin: null,
      dateEnd: null,
      unsavedUnitCount: 0,
      locality: null,
      municipality: null,
      namedPlaceID: null,
      localityCount: 0,
      unitList: [],
      taxonID: []
    };

    if (document.gatherings && Array.isArray(document.gatherings)) {
      for (let i = 0; i < document.gatherings.length; i++) {
        const gathering = document.gatherings[i];
        if (i === 0) {
          info.locality = gathering.locality;
          info.municipality = gathering.municipality ? gathering.municipality : '';
          info.namedPlaceID = gathering.namedPlaceID;
          info.localityCount = document.gatherings.length - 1;
        }
        DocumentInfoService.updateMinMaxDates(info, gathering.dateBegin);
        DocumentInfoService.updateMinMaxDates(info, gathering.dateEnd);

        if (gathering.units) {
          gathering.units.reduce((result: string[], unit: Units) => {
            if (this.isEmptyUnit(unit, form)) { return result; }

            let taxon = unit.informalNameString || '';
            if (unit.identifications && Array.isArray(unit.identifications)) {
              taxon = unit.identifications.reduce(
                (acc, cur) => {
                  if (cur.taxonID) {
                    info.taxonID.push(cur.taxonID);
                  }
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
    }

    if (document.gatheringEvent) {
      const event = document.gatheringEvent;
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

  public static isEmptyUnit(unit: Units, form: Form.List) {
    if (form?.options?.prepopulateWithInformalTaxonGroups || form?.options?.emptyOnNoCount) {
      let result = true;
      Global.documentCountUnitProperties.forEach(key => {
        if (typeof unit[key] !== 'undefined' && unit[key] !== '' && unit[key] !== null) {
          result = false;
        }
      });
      return result;
    }

    if (unit.identifications) {
      for (let j = 0; j < unit.identifications.length; j++) {
        const ident = unit.identifications[j];

        if (unit.informalNameString || ident.taxon || ident.taxonID || ident.taxonVerbatim || unit.informalTaxonGroups) {
          return false;
        }
      }
    }

    return true;
  }
}
