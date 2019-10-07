import { Injectable } from '@angular/core';
import { FieldType, ILabelField } from 'label-designer';
import { from, Observable, of } from 'rxjs';
import { Document } from '../model/Document';
import { concatMap, map, switchMap, tap, toArray } from 'rxjs/operators';
import { FormService as ToolsFormService } from './form.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { IdService } from './id.service';
import { SessionStorage } from 'ngx-webstorage';
import { SchemaService } from '../../../../projects/label-designer/src/lib/schema.service';
import { ILabelData } from '../../../../projects/label-designer/src/lib/label-designer.interface';
import { TriplestoreLabelService } from './triplestore-label.service';


@Injectable({
  providedIn: 'root'
})
export class PdfLabelService {

  @SessionStorage('pdf-data', [])
  private data: ILabelData[];

  skipFields: string[] = [
    '@type',
    'geometry',
    'editors',
    'secureLevel',
    'gatheringEvent.legPublic',
    'gatherings.namedPlaceID',
    'gatherings.images',
    'gatherings.units.unitFact.autocompleteSelectedTaxonID',
  ];

  defaultFields: ILabelField[] = [
    { field: 'gatherings.units.id', content: 'http://tun.fi/EXAMPLE', label: 'ID - QRCode', type: FieldType.qrCode },
    { field: 'gatherings.units.id', content: 'http://tun.fi/EXAMPLE', label: 'ID', type: FieldType.uri },
    { field: 'gatherings.units.id_domain', content: 'EXAMPLE', label: 'label.domain', type: FieldType.domain },
    { field: 'gatherings.units.id_short', content: 'EXAMPLE', label: 'label.id_short', type: FieldType.id },
    { field: '', content: 'Text', label: 'Text', type: FieldType.text }
  ];


  constructor(
    private formService: ToolsFormService,
    private schemaService: SchemaService,
    private translateService: TranslateService,
    private triplestoreLabelService: TriplestoreLabelService
  ) {
    this.defaultFields.forEach(field => {
      if (field.label.startsWith('label.')) {
        field.label = this.translateService.instant(field.label);
      }
    });
  }

  setData(documents: Document[]): Observable<boolean> {
    return this.openDocuments(documents).pipe(
      switchMap(openDocuments => this.allPossibleFields().pipe(
        map(fields => this.schemaService.convertDataToLabelData(
          [...fields, {field: 'id', label: ''}], openDocuments, 'gatherings.units')
        ),
        map(data => data.map(item => {
          item['gatherings.units.id'] = IdService.getUri(item['gatherings.units.id'] || item['id']) || '';
          item['gatherings.units.id_short'] = item['gatherings.units.id'] || item['id'] || '';
          item['gatherings.units.id_domain'] = (item['gatherings.units.id'] as string)
            .replace(item['gatherings.units.id_short'] as string, '');
          return item;
        })),
        tap(data => this.data = data),
        map(() => true)
      ))
    );
  }

  getData(): ILabelData[] {
    return this.data || [];
  }

  allPossibleFields(): Observable<ILabelField[]> {
    return this.formService.getForm(environment.defaultForm, this.translateService.currentLang).pipe(
      map(form => this.schemaService.schemaToAvailableFields(form.schema, [...this.defaultFields], { skip: this.skipFields }))
    );
  }

  private openDocuments(documents: Document[]): Observable<Document[]> {
    return from(documents).pipe(
      concatMap((document) => this.openDocument(document)),
      toArray()
    );
  }

  private openDocument(document: Document): Observable<Document> {
    const keys = this.getAllKeys(document);
    if (keys.length === 0) {
      return of(document);
    }
    const unique = [...new Set(keys)];
    const keyMap: {[key: string]: string} = {};
    return from(unique).pipe(
      concatMap(id => this.triplestoreLabelService.get(id, this.translateService.currentLang).pipe(
        tap(value => keyMap[id] = value)
      )),
      toArray(),
      map(() => this.documentKeysToLabel(document, keyMap))
    );
  }

  private getAllKeys(document: Document): string[] {
    const keys: string[] = [];
    if (document.gatheringEvent && Array.isArray(document.gatheringEvent.leg) && document.gatheringEvent.leg.length > 0) {
      keys.push(...document.gatheringEvent.leg);
    }
    if (Array.isArray(document.gatherings)) {
      document.gatherings.forEach(gathering => {
        if (gathering && Array.isArray(gathering.leg) && gathering.leg.length > 0) {
          keys.push(...gathering.leg);
        }
      });
    }
    return keys;
  }

  private documentKeysToLabel(document: Document, keyMap): Document {
    const result: Document = {...document};
    if (result.gatheringEvent && result.gatheringEvent.leg) {
      result.gatheringEvent = {...document.gatheringEvent, leg: this.keysToLabel(result.gatheringEvent.leg, keyMap)};
    }
    if (Array.isArray(result.gatherings)) {
      result.gatherings = [...document.gatherings.map(gathering => {
        if (gathering.leg) {
          return {...gathering, leg: this.keysToLabel(gathering.leg, keyMap)};
        }
        return gathering;
      })];
    }
    return result;
  }

  private keysToLabel(value, keyMap) {
    if (Array.isArray(value)) {
      return value.map(val => this.keysToLabel(val, keyMap));
    }
    return keyMap[value] || value;
  }

}
