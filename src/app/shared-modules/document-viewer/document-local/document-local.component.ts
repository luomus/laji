import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges,
Output, EventEmitter, HostListener } from '@angular/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { FormService } from '../../../shared/service/form.service';
import { Document } from '../../../shared/model/Document';
import { Units } from '../../../shared/model/Units';
import { TranslateService } from '@ngx-translate/core';
import { DocumentInfoService } from '../../../shared/service/document-info.service';
import { Global } from '../../../../environments/global';
import { Image } from '../../../shared/model/Image';

const { JSONPath } = require('jsonpath-plus');

@Component({
  selector: 'laji-document-local',
  templateUrl: './document-local.component.html',
  styleUrls: ['./document-local.component.css']
})
export class DocumentLocalComponent implements OnChanges {
  @Input() document: Document;
  @Input() view: 'viewer'|'print' = 'viewer';
  @Input() showSpinner = false;

  @Output() close = new EventEmitter<boolean>();

  collectionContestFormId = Global.forms.collectionContest;

  mapData: any[] = [];
  imageData: {[key: string]: any} = {};
  fields = {};
  formLogo: string;
  gatheringGeometryJSONPath: string | string[];
  zoomToData: boolean;

  loading = false;
  private parseDocSub: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private lajiApi: LajiApiService,
    private formService: FormService,
    private translate: TranslateService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.document) {
      if (this.parseDocSub) {
        this.parseDocSub.unsubscribe();
      }

      this.fields = {};
      this.imageData = {};
      this.mapData = [];

      if (this.document) {
        this.loading = true;
        this.parseDocSub = this.parseDocument(this.document)
          .subscribe(() => {
            this.loading = false;
            this.cd.markForCheck();
          });
      }
    }
  }

  private parseDocument(doc: Document): Observable<any> {
    return this.getForm(doc.formID)
      .pipe(
        switchMap(form => {
          this.formLogo = form.logo;

          const observables = [];
          if (doc.images && doc.images.length > 0) {
            observables.push(this.getImages(doc));
          }

          doc.gatherings.forEach((gathering, i) => {
            try {
              const paths = this.gatheringGeometryJSONPath || '$.geometry';
              const geoData = {type: 'GeometryCollection', geometries:
                (Array.isArray(paths)  ? paths : [paths]).reduce((geometries, path) => {
                  return [...geometries, ...JSONPath({json: gathering, path})];
                }, []).filter(g => g)
              };
              if (geoData && geoData.geometries[0]) {
                this.mapData[i] = {geoJSON: geoData};
              }
            } catch (e) { }
            if (gathering.images && gathering.images.length > 0) {
              observables.push(this.getImages(gathering));
            }

            const units: Units[] = [];
            (gathering.units || []).reduce((arr: Units[], unit: Units) => {
              if (DocumentInfoService.isEmptyUnit(unit, form)) {
                return arr;
              }
              if (unit.images && unit.images.length > 0) {
                observables.push(this.getImages(unit));
              }
              arr.push(unit);
              return arr;
            }, units);
            gathering.units = units;
          });
          return observables.length > 0 ? forkJoin(observables) : of(observables);
        })
      );
  }

  private getImages(obj): Observable<Image[]> {
    return this.lajiApi.getList(LajiApi.Endpoints.images, {
      lang: this.translate.currentLang,
      page: 1,
      pageSize: 1000,
      idIn: obj.images.join(',')
    })
      .pipe(
        map(res => res.results),
        tap(images => {
          this.imageData[obj.id] = images;
        })
      );
  }

  private getForm(formId: string): Observable<any> {
    return this.formService.getFormInJSONFormat(formId, this.translate.currentLang)
      .pipe(tap(form => {
        this.setAllFields(form.fields, form.uiSchema, ['document', 'gatherings', 'units', 'identifications'], (form.namedPlaceOptions || {}).documentViewerForcedFields);
        if (form.namedPlaceOptions && form.namedPlaceOptions.documentViewerGatheringGeometryJSONPath) {
          this.gatheringGeometryJSONPath = form.namedPlaceOptions.documentViewerGatheringGeometryJSONPath;
          this.zoomToData = form.namedPlaceOptions.documentViewerZoomToData;
        }
      }));
  }

  private setAllFields(fields: any[], uiSchema: any, queue: string[], forcedFields?: string[]) {
    const res = this.processFields(fields, uiSchema, queue.length > 1 ? queue[1] : undefined, forcedFields);
    this.fields[queue[0]] = res.fields;

    const next = res.next;

    if (next) {
      this.setAllFields(next.fields, uiSchema && uiSchema[next.name] ? uiSchema[next.name].items : undefined, queue.slice(1), forcedFields);
    }
  }

  private processFields(fields: any[], uiSchema: any, nextName?: string, forcedFields: string[] = []) {
    let next;

    fields = fields.reduce((arr, field) => {
      if (field.name === nextName) {
        next = field;
        return arr;
      }

      let add = true;

      if (field.name === 'geometry' || field.name === 'images') {
        add = false;
      }

      if (uiSchema && uiSchema[field.name] && (
        uiSchema[field.name]['ui:field'] === 'HiddenField' || uiSchema[field.name]['ui:widget'] === 'HiddenWidget')) {
        add = false;
      }

      if (!add && forcedFields.indexOf(field.name) === -1) {
        return arr;
      }

      if (field.type === 'fieldset' && uiSchema && uiSchema[field.name]) {
        field.fields = this.processFields(field.fields, uiSchema[field.name]).fields;
      }

      arr.push(field);
      return arr;
    }, []);

    return {
      fields: fields,
      next: next
    };
  }

  closeDocument() {
    this.close.emit(true);
  }


  @HostListener('window:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {

    if (e.keyCode === 27 ) {
       e.stopImmediatePropagation();
       this.closeDocument();
      }

  }


}
