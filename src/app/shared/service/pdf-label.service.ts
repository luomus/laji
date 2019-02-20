import { Injectable } from '@angular/core';
import { LabelField } from 'generic-label-maker';
import { Observable, of } from 'rxjs';
import { Document } from '../model/Document';
import { map } from 'rxjs/operators';

export interface IFlatDocument {
  [key: string]: string|number|boolean|string[];
}

@Injectable({
  providedIn: 'root'
})
export class PdfLabelService {

  possibleFields: LabelField[] = [
    {field: 'id', content: 'http://id.luomus.fi/GV.1', label: 'Tunniste - QRCode', type: 'qr-code'},
    {field: 'id', content: 'http://id.luomus.fi/GV.1', label: 'Tunniste'},
    {field: 'text', content: '', label: 'Tekstiä', type: 'text'},
    {field: 'leg', content: 'Matti Meikäläinen', label: 'Kerääjä'},
    {field: 'taxon', content: 'Parus major', label: 'Laji'},
    {field: 'det', content: 'Martti Vainio', label: 'Määrittäjä'},
    {field: 'detDate', content: '01.02.2019', label: 'Määrityspäivä'},
    {field: 'count', content: '10', label: 'Määrä'},
    {field: 'sex', content: 'uros', label: 'Sukupuoli'},
    {field: 'country', content: 'Suomi', label: 'Maa'},
    {field: 'municipality', content: 'Hki', label: 'Kunta'},
    {field: 'biologicalProvince', content: 'Etelä-Pohjanmaa', label: 'Eliömaakunta'},
    {field: 'locality', content: 'Kuusen alla', label: 'Paikannimet'},
    {field: 'keywords', content: 'Notebook, general observations', label: 'Kokoelma'},
    {field: 'habitat', content: 'lettokorvet', label: 'Habitaatti'},
    {field: 'coordinates', content: '338:665', label: 'Koordinaatit'},
    {field: 'coordinateSystem', content: 'YKJ', label: 'koordinaattijärjestelmä'},
    {field: 'notes', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non.', label: 'Muistiipanot'}
  ];

  private data: Document[];

  private fieldLocations = {
    'id': ['gatherings.units.id', 'id'],
    'leg': ['gatherings.leg', 'gatheringEvent.leg'],
    'taxon': ['gatherings.units.identifications.taxon'],
    'det': ['gatherings.units.identifications.det'],
    'detDate': ['gatherings.units.identifications.detDate'],
    'count': ['gatherings.units.count'],
    'sex': ['gatherings.units.sex'],
    'locality': ['gatherings.locality'],
    'country': ['gatherings.country'],
    'municipality': ['gatherings.municipality'],
    'biologicalProvince': ['gatherings.biologicalProvince'],
    'habitat': ['gatherings.habitat', 'gatheringEvent.habitat'],
  };

  constructor() { }

  setData(documents: Document[]) {
    this.data = documents;
  }


  allPossibleFields(): Observable<LabelField[]> {
    if (!this.data || this.data.length === 0) {
      return of(this.possibleFields);
    }
    return of(this.data[0]).pipe(
      map(document => this.documentToFlat(document)),
      map(flat => this.flatToContent(flat[0], this.possibleFields))
    );
  }

  private flatToContent(doc: IFlatDocument, fields: LabelField[]): LabelField[] {
    if (!doc) {
      return fields;
    }
    return fields.map(field => {
      let content = '';
      if (this.fieldLocations[field.field]) {
        for (const path of this.fieldLocations[field.field]) {
          if (doc[path]) {
            content = doc[path] as string;
            break;
          }
        }
      }
      return {...field, content: content};
    });
  }

  private documentToFlat(document: Document, docs: IFlatDocument[] = []): IFlatDocument[] {
    const {acknowledgedWarnings, gatherings, gatheringEvent, ...restDocument} = document;
    gatherings.forEach(gathering => {
      const {units, geometry, wgs84Geometry, gatheringFact, taxonCensus, ...restGathering} = gathering;
      gathering.units.forEach(unit => {
        const {identifications, typeSpecimens, unitFact, unitGathering, measurement, ...restUnit} = unit;
        docs.push({
          ...restDocument,
          ...this.addKeyPrefix(gatheringEvent, 'gatheringEvent'),
          ...this.addKeyPrefix(gatheringFact, 'gatherings.gatheringFact'),
          ...this.addKeyPrefix(taxonCensus, 'gatherings.taxonCensus'),
          ...this.addKeyPrefix(restGathering, 'gatherings'),
          ...this.addKeyPrefix(restUnit, 'gatherings.units'),
          ...this.addKeyPrefix(identifications[0], 'gatherings.units.identifications')
        });
      });
    });
    return docs;
  }

  private addKeyPrefix(obj: object, prefix = ''): IFlatDocument {
    const result = {};
    Object.keys(obj).forEach(key => {
      result[prefix + '.' + key] = obj[key];
    });
    return result;
  }

}
