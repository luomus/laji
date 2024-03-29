import { Injectable } from '@angular/core';
import { FieldType, ILabelField } from '@luomus/label-designer';
import { from, Observable, of } from 'rxjs';
import { Document } from '../model/Document';
import { concatMap, map, switchMap, tap, toArray } from 'rxjs/operators';
import { FormService as ToolsFormService } from './form.service';
import { TranslateService } from '@ngx-translate/core';
import { IdService } from './id.service';
import { SessionStorage } from 'ngx-webstorage';
import { SchemaService, ILabelData } from '@luomus/label-designer';
import { TriplestoreLabelService } from './triplestore-label.service';
import { LabelFilter } from '../../shared-modules/own-submissions/own-datatable/own-datatable.component';
import { Units } from '../model/Units';
import { Global } from '../../../environments/global';
import { Gatherings } from '../model/Gatherings';


@Injectable({
  providedIn: 'root'
})
export class PdfLabelService {

  @SessionStorage('pdf-data', [])
  private data: ILabelData[] | undefined;
  private memoryData: ILabelData[] | undefined;

  private gatheringGeometryField = 'gatherings.geometry';
  private unitGeometryField = 'gatherings.units.unitGathering.geometry';

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

  specialFields: {[field: string]: ILabelField[]} = {
    [this.gatheringGeometryField]: [
      { field: this.gatheringGeometryField + '_coordinateVerbatim', label: 'label.coordinateVerbatim' },
      { field: this.gatheringGeometryField + '_pointCoordinates', label: 'label.pointCoordinates' }
    ],
    [this.unitGeometryField]: [
      { field: this.unitGeometryField + '_coordinateVerbatim', label: 'label.coordinateVerbatim' },
      { field: this.unitGeometryField + '_pointCoordinates', label: 'label.pointCoordinates' }
    ]
  };

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
      this.translateLabel(field);
    });
    Object.keys(this.specialFields).forEach(key => {
      this.specialFields[key].forEach(field => {
        this.translateLabel(field);
      });
    });
  }

  setData(documents: Document[], filter: LabelFilter): Observable<boolean> {
    this.memoryData = undefined;
    return this.filterDocuments(documents, filter).pipe(
      switchMap(docs => this.openDocuments(docs)),
      switchMap(openDocuments => this.allPossibleFields().pipe(
        map(fields => this.schemaService.convertDataToLabelData(
          [
            ...fields,
            {field: 'id', label: ''}
          ],
          openDocuments,
          'gatherings.units',
          {
            [this.gatheringGeometryField]: this.getTransformGeometryDataFunction(this.gatheringGeometryField),
            [this.unitGeometryField]: this.getTransformGeometryDataFunction(this.unitGeometryField)
          }
        )),
        map(data => data.map(item => {
          item['gatherings.units.id'] = IdService.getUri(item['gatherings.units.id'] || item['id']) || '';
          item['gatherings.units.id_short'] = IdService.getId(item['gatherings.units.id'] || item['id'] || '');
          item['gatherings.units.id_domain'] = (item['gatherings.units.id'] as string)
            .replace(item['gatherings.units.id_short'] as string, '');
          return item;
        })),
        tap(data => {
          try {
            this.data = data;
          } catch (e) {
            this.memoryData = data;
          }
        }),
        map(() => true)
      ))
    );
  }

  getData(): ILabelData[] {
    return this.memoryData || this.data || [];
  }

  allPossibleFields(): Observable<ILabelField[]> {
    return this.formService.getForm(Global.forms.default).pipe(
      map(form => form
        ? this.schemaService.schemaToAvailableFields(form.schema, [...this.defaultFields], { skip: this.skipFields, special: this.specialFields })
        : []
      )
    );
  }

  private getTransformGeometryDataFunction(path: string): (data: any) => Record<string, string | string[]> {
    return (geometryData) => {
      const result: Record<string, string | string[]> = {};

      const coordinateVerbatim = [];
      if (geometryData.coordinateVerbatim) {
        coordinateVerbatim.push(geometryData.coordinateVerbatim);
      }
      geometryData.geometries?.forEach((geometry: any) => {
        if (geometry.coordinateVerbatim) {
          coordinateVerbatim.push(geometry.coordinateVerbatim);
        }
      });
      result[path + '_coordinateVerbatim'] = coordinateVerbatim;

      const singleGeometry = !geometryData.geometries
        ? geometryData
        : geometryData.geometries.length === 1
          ? geometryData.geometries[0]
          : null;
      if (singleGeometry && singleGeometry.type === 'Point' && !singleGeometry.radius) {
        result[path + '_pointCoordinates'] = singleGeometry.coordinates[1] + ', ' + singleGeometry.coordinates[0] + ' (wgs84)';
      }

      return result;
    };
  }

  private filterDocuments(documents: Document[], filter: LabelFilter): Observable<Document[]> {
    if (this.isEmptyLabelFilter(filter)) {
      return of(documents);
    }
    return from(documents).pipe(
      map(doc => this.filterDocument(doc, filter)),
      toArray(),
      map(docs => docs.filter(doc => !!doc) as Document[]),
    );
  }

  private filterDocument(doc: Document, filter: LabelFilter): Document | null {
    if (!doc.gatherings) {
      return null;
    }
    doc.gatherings = doc.gatherings.reduce((gatheringPrev, gathering) => {
      if (!gathering || !gathering.units || gathering.units.length === 0) {
        return gatheringPrev;
      }
      gathering.units = gathering.units.reduce((unitPrev, unit) => {
        // Filter out preserved specimen
        if (filter.onlyPreservedSpecimen && unit.recordBasis !== Units.RecordBasisEnum.RecordBasisPreservedSpecimen) {
          return unitPrev;
        }

        // Filter out units that have older det date than the on in the filters
        if (filter.detLaterThan &&
          (
            !unit.identifications || !unit.identifications[0] || !unit.identifications[0].detDate ||
            new Date(unit.identifications[0].detDate) <= new Date(filter.detLaterThan)
          )) {
          return unitPrev;
        }

        // Repeat the unit if the user selected the multiplyByCount filter
        const unitCount = filter.multiplyByCount ? this.countIndividuals(unit) : 1;
        for (let i = 0; i < unitCount; i++) {
          unitPrev.push(unit);
        }
        return unitPrev;
      }, [] as Units[]);

      // Only add gatherings that have some unit information in them
      if (gathering.units.length > 0) {
        gatheringPrev.push(gathering);
      }
      return gatheringPrev;
    }, [] as Gatherings[]);

    // Only return documents that have some gathering information in them
    if (doc.gatherings.length === 0) {
      return null;
    }
    return doc;
  }

  private countIndividuals(unit: Units): number {
    let cnt = 0;
    Global.documentCountUnitProperties.forEach(prop => {
      const num = Number((unit as any)[prop]);
      if (!isNaN(num)) {
        cnt += num;
      }
    });
    return cnt > 0 ? cnt : 1;
  }

  private openDocuments(documents: Document[]): Observable<Document[]> {
    return from(documents).pipe(
      concatMap((document) => this.openDocument(document)),
      toArray()
    );
  }

  private isEmptyLabelFilter(filter: LabelFilter): boolean {
    return !(filter.multiplyByCount || filter.onlyPreservedSpecimen || !!filter.detLaterThan);
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

  private documentKeysToLabel(document: Document, keyMap: {[key: string]: string}): Document {
    const result: Document = {...document};
    if (result.gatheringEvent) {
      result.gatheringEvent = this.openGathering({...document.gatheringEvent}, keyMap);
    }
    if (Array.isArray(result.gatherings)) {
      result.gatherings = [...(document.gatherings || []).map(originalGathering => {
        const gathering = {...originalGathering};

        if (Array.isArray(gathering.units)) {
          gathering.units = [...gathering.units.map(originalUnit => {
            const unit = {...originalUnit};

            if (Array.isArray(unit.identifications)) {
              unit.identifications = [...unit.identifications.map(originalIdentification => {
                const identification = {...originalIdentification};
                if (identification.detDate) {
                  identification.detDate = this.ISODateToLocal(identification.detDate);
                }
                return identification;
              })];
            }

            if (unit.unitGathering) {
              unit.unitGathering = this.openGathering({...unit.unitGathering}, keyMap);
            }

            return unit;
          })];
        }

        return this.openGathering(gathering, keyMap);
      })];
    }
    return result;
  }

  private openGathering(gathering: any, keyMap: {[key: string]: string}) {
    if (gathering.leg) {
      gathering.leg = this.keysToLabel(gathering.leg, keyMap);
    }
    if (gathering.dateBegin) {
      gathering.dateBegin = this.ISODateToLocal(gathering.dateBegin);
    }
    if (gathering.dateEnd) {
      gathering.dateEnd = this.ISODateToLocal(gathering.dateEnd);
    }
    return gathering;
  }

  private translateLabel(field: ILabelField) {
    if (field.label.startsWith('label.')) {
      field.label = this.translateService.instant(field.label);
    }
  }

  private ISODateToLocal(value: string) {
    if (typeof value !== 'string') {
      return value;
    }
    return value.replace(/([0-9]+)-([0-9]+)-([0-9]+)/, '$3.$2.$1').replace('T', ' ');
  }

  private keysToLabel(value: string, keyMap: {[key: string]: string}): string;
  private keysToLabel(value: string[], keyMap: {[key: string]: string}): string[];
  private keysToLabel(value: string | string[], keyMap: {[key: string]: string}): string | string[] {
    if (Array.isArray(value)) {
      return value.map(val => this.keysToLabel(val, keyMap));
    }
    return keyMap[value] || value;
  }

}
