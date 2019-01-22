import { Injectable } from '@angular/core';
import { Document } from '../model/Document';
import { Units } from '../model/Units';
import { SearchDocument } from '../../shared-modules/own-submissions/own-submissions.component';

/**
 * Document Info service
 */
@Injectable({providedIn: 'root'})
export class DocumentInfoService {
  static getGatheringInfo(document: Document, form: any) {
    const info = {
      dateBegin: null,
      dateEnd: null,
      unsavedUnitCount: 0,
      locality: null,
      namedPlaceID: null,
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

  static getGatheringInfoFromSearchDocument(document: SearchDocument, form: any) {
    const info = {
      dateBegin: null,
      dateEnd: null,
      unsavedUnitCount: 0,
      locality: null,
      namedPlaceID: null,
      localityCount: 0,
      unitList: []
    };
    info.locality = (document['gatherings[*].locality'] || []).join(', ');
    info.namedPlaceID = document['gatherings[*].gatherings[*].namedPlaceID'] ? document['gatherings[*].gatherings[*].namedPlaceID'][0] : '';
    info.localityCount = document['gatherings[*].id'].length;

    ['gatherings[*].dateBegin', 'gatherings[*].dateEnd'].forEach(spot => {
      if (document[spot]) {
        document[spot].forEach(date => DocumentInfoService.updateMinMaxDates(info, date));
      }
    });

    if (document['gatherings[*].units[*]']) {
      document['gatherings[*].units[*]'].reduce((result: string[], unit: Units) => {
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
    DocumentInfoService.updateMinMaxDates(info, document['gatheringEvent.dateBegin']);
    DocumentInfoService.updateMinMaxDates(info, document['gatheringEvent.dateEnd']);
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

  public static isEmptyUnit(unit: Units, form: any) {
    if (form.features && (
        form.features.indexOf('MHL.featurePrepopulateWithInformalTaxonGroups') !== -1 ||
        form.features.indexOf('MHL.featureEmptyOnNoCount') !== -1
      )
    ) {
      return !(
        unit.count ||
        unit.individualCount ||
        unit.pairCount ||
        unit.abundanceString ||
        unit.maleIndividualCount ||
        unit.femaleIndividualCount
      );
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
