import { Injectable } from '@angular/core';
import { FieldType, FormService as LabelFormService, ILabelField } from 'generic-label-maker';
import { Observable } from 'rxjs';
import { Document } from '../model/Document';
import { map } from 'rxjs/operators';
import { FormService as ToolsFormService } from './form.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { IdService } from './id.service';
import { SessionStorage } from 'ngx-webstorage';

export interface IFlatDocument {
  [key: string]: string|number|boolean|string[];
}

@Injectable({
  providedIn: 'root'
})
export class PdfLabelService {

  @SessionStorage('pdf-data', [])
  private data: IFlatDocument[];

  skipFields: string[] = [
    'editors',
    'secureLevel',
    'gatheringEvent.legPublic',
    'gatherings.namedPlaceID',
    'gatherings.images',
    'gatherings.units.unitFact.autocompleteSelectedTaxonID',
  ];

  defaultFields: ILabelField[] = [
    { field: 'id', content: 'http://tun.fi/EXAMPLE', label: 'ID - QRCode', type: FieldType.qrCode },
    { field: 'id', content: 'http://tun.fi/EXAMPLE', label: 'ID', type: FieldType.id },
    { field: 'id_short', content: 'EXAMPLE', label: 'label.id_short', type: FieldType.id },
    { field: '', content: '', label: 'Text', type: FieldType.text }
  ];


  constructor(
    private formService: ToolsFormService,
    private labelFormService: LabelFormService,
    private translateService: TranslateService
  ) {
    this.defaultFields[2].label = this.translateService.instant(this.defaultFields[2].label);
  }

  setData(documents: Document[]) {
    const docs: IFlatDocument[] = [];
    documents.forEach(doc => this.documentToFlat(doc, docs));
    this.data = docs;
  }

  getData(): IFlatDocument[] {
    return this.data || [];
  }

  allPossibleFields(): Observable<ILabelField[]> {
    return this.formService.getForm(environment.defaultForm, this.translateService.currentLang).pipe(
      map(form => this.labelFormService.schemaToAvailableFields(form.schema, [...this.defaultFields], { skip: this.skipFields }))
    );
  }

  private documentToFlat(document: Document, docs: IFlatDocument[] = []): IFlatDocument[] {
    const {acknowledgedWarnings, gatherings, gatheringEvent, ...restDocument} = document;
    (gatherings || []).forEach(gathering => {
      const {units, geometry, wgs84Geometry, gatheringFact, taxonCensus, ...restGathering} = gathering;
      (units || []).forEach(unit => {
        const {identifications, typeSpecimens, unitFact, unitGathering, measurement, ...restUnit} = unit;
        docs.push({
          ...restDocument,
          ...this.addKeyPrefix(gatheringEvent, 'gatheringEvent'),
          ...this.addKeyPrefix(gatheringFact, 'gatherings.gatheringFact'),
          ...this.addKeyPrefix(taxonCensus, 'gatherings.taxonCensus'),
          ...this.addKeyPrefix(restGathering, 'gatherings'),
          ...this.addKeyPrefix(restUnit, 'gatherings.units'),
          ...this.addKeyPrefix(identifications && identifications[0] ? identifications[0] : {}, 'gatherings.units.identifications'),
          id: IdService.getUri(unit.id || gathering.id || document.id),
          id_short: unit.id || gathering.id || document.id,
        });
      });
    });
    return docs;
  }

  private addKeyPrefix(obj: object, prefix = ''): IFlatDocument {
    const result = {};
    if (obj) {
      Object.keys(obj).forEach(key => {
        result[prefix + '.' + key] = obj[key];
      });
    }
    return result;
  }

}
