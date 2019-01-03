import { Component, OnChanges, SimpleChanges, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { FormService } from '../../../shared/service/form.service';
import { Document } from '../../../shared/model/Document';
import { Units } from '../../../shared/model/Units';
import { TranslateService } from '@ngx-translate/core';
import { Image } from '../../../shared/image-gallery/image.interface';
import { DocumentInfoService } from '../../../shared/service/document-info.service';
import { Global } from '../../../../environments/global';
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
  @Input() gatheringGeometryJSONPath = '$.geometry';

  collectionContestFormId = Global.forms.collectionContest;

  mapData: any[] = [];
  imageData: {[key: string]: any} = {};
  fields = {};
  formLogo: string;

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
            const geoData = JSONPath({json: gathering, path: this.gatheringGeometryJSONPath});
            // TODO There could be more than one hit... But in our current domain there isn't, so we ignore the issue.
            if (geoData && geoData[0]) {
              this.mapData[i] = {geoJSON: geoData[0]};
            }
            if (gathering.images && gathering.images.length > 0) {
              observables.push(this.getImages(gathering));
            }

            const units: Units[] = [];
            gathering.units.reduce((arr: Units[], unit: Units) => {
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
        this.setAllFields(form.fields, form.uiSchema, ['document', 'gatherings', 'units', 'identifications']);
      }));
  }

  private setAllFields(fields: any[], uiSchema: any, queue: string[]) {
    const res = this.processFields(fields, uiSchema, queue.length > 1 ? queue[1] : undefined);
    this.fields[queue[0]] = res.fields;

    const next = res.next;

    if (next) {
      this.setAllFields(next.fields, uiSchema && uiSchema[next.name] ? uiSchema[next.name].items : undefined, queue.slice(1));
    }
  }

  private processFields(fields: any[], uiSchema: any, nextName?: string) {
    let next;

    fields = fields.reduce((arr, field) => {
      if (field.name === nextName) {
        next = field;
        return arr;
      }

      if (field.name === 'geometry' || field.name === 'images') {
        return arr;
      }

      if (uiSchema && uiSchema[field.name] && (
        uiSchema[field.name]['ui:field'] === 'HiddenField' || uiSchema[field.name]['ui:widget'] === 'HiddenWidget')) {
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
}
