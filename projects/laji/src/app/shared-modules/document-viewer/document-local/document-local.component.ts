import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges,
Output, EventEmitter, HostListener } from '@angular/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import {delay, map, switchMap, tap} from 'rxjs/operators';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { FormService } from '../../../shared/service/form.service';
import { Document } from '../../../shared/model/Document';
import { Units } from '../../../shared/model/Units';
import { TranslateService } from '@ngx-translate/core';
import { DocumentInfoService } from '../../../shared/service/document-info.service';
import { Image } from '../../../shared/model/Image';
import { Form } from '../../../shared/model/Form';
import { JSONPath } from 'jsonpath-plus';
import { DeleteOwnDocumentService } from '../../../shared/service/delete-own-document.service';


@Component({
  selector: 'laji-document-local',
  templateUrl: './document-local.component.html',
  styleUrls: ['./document-local.component.css']
})
export class DocumentLocalComponent implements OnChanges {
  @Input({ required: true }) document!: Document;
  @Input() view: 'viewer'|'print' = 'viewer';
  @Input() showSpinner = false;

  @Output() documentClose = new EventEmitter<boolean>();

  collectionContestFormId = 'MHL.25';

  mapData: any[] = [];
  imageData: {[key: string]: any} = {};
  fields: Record<string, any[]> = {};
  formLogo?: string;
  gatheringGeometryJSONPath?: string | string[];
  zoomToData?: boolean;

  loading = false;
  private parseDocSub?: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private lajiApi: LajiApiService,
    private formService: FormService,
    private translate: TranslateService,
    private deleteDocumentService: DeleteOwnDocumentService
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
          .pipe(delay(0))
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

          doc.gatherings?.forEach((gathering, i) => {
            try {
              const paths = this.gatheringGeometryJSONPath || '$.geometry';
              const geoData = {type: 'GeometryCollection', geometries:
                (Array.isArray(paths)  ? paths : [paths]).reduce(
                  (geometries: any[], path: string) => [...geometries, ...JSONPath({json: gathering, path})], []
                ).filter(g => g)
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

  private getImages(obj: any): Observable<Image[]> {
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

  private getForm(formId?: string): Observable<any> {
    return this.formService.getFormInJSONFormat(formId)
      .pipe(tap((form: Form.JsonForm) => {
        this.setAllFields(
          form.fields,
          form.uiSchema,
          ['document', 'gatherings', 'units', 'identifications'],
          form.options?.namedPlaceOptions?.documentViewerForcedFields
        );
        if (form.options?.namedPlaceOptions?.documentViewerGatheringGeometryJSONPath) {
          this.gatheringGeometryJSONPath = form.options.namedPlaceOptions.documentViewerGatheringGeometryJSONPath;
          this.zoomToData = form.options.namedPlaceOptions.documentViewerZoomToData;
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
    let next: any;

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
      fields,
      next
    };
  }

  closeDocument() {
    this.deleteDocumentService.emitChildEvent(this.document.id);
    this.documentClose.emit(true);
    this.deleteDocumentService.emitChildEvent(null);
  }


  @HostListener('document:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {

    if (e.keyCode === 27 ) {
       e.stopImmediatePropagation();
       this.closeDocument();
      }

  }


}
