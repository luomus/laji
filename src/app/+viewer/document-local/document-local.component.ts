import { Component, OnInit, OnChanges, SimpleChanges, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-document-local',
  templateUrl: './document-local.component.html',
  styleUrls: ['./document-local.component.css']
})
export class DocumentLocalComponent implements OnInit, OnChanges {
  @Input() document: Document;
  @Input() useWorldMap = true;
  @Input() view: 'viewer'|'print' = 'viewer';

  mapData: any[] = [];
  imageData: {[key: string]: any} = {};

  fields = {};

  private formFetch: Subscription;
  private imageFetches: Subscription[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private lajiApi: LajiApiService,
    private formService: FormService,
    private translate: TranslateService
  ) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.document) {
      this.setFields(this.document ? this.document.formID : undefined);
      this.parseDocument(this.document);
    }
  }

  private parseDocument(doc: Document) {
    for (let i = 0; i < this.imageFetches.length; i++) {
      if (this.imageFetches[i]) {
        this.imageFetches[i].unsubscribe();
      }
    }
    this.imageFetches = [];
    this.imageData = {};
    this.mapData = [];

    if (doc) {
      this.getImages(doc);

      doc.gatherings.map((gathering, i) => {
        if (gathering.geometry) {
          this.mapData[i] = gathering.geometry;
        }
        this.getImages(gathering);
        gathering.units.map((unit) => {
          this.getImages(unit);
        });
      });
    }
  }

  private getImages(obj) {
    if (obj.images && obj.images.length > 0) {
      this.imageFetches.push(
        this.lajiApi.getList(LajiApi.Endpoints.images, {
          lang: this.translate.currentLang,
          page: 1,
          pageSize: 1000,
          idIn: obj.images.join(',')
        }).subscribe((res) => {
          this.imageData[obj.id] = res.results;
        })
      );
    }
  }

  private setFields(formId: string) {
    if (this.formFetch) {
      this.formFetch.unsubscribe();
    }

    this.fields = {};

    if (formId) {
      this.formFetch = this.formService.getFormInJSONFormat(formId, this.translate.currentLang)
        .subscribe(form => {
          this.setAllFields(form.fields, form.uiSchema, ['document', 'gatherings', 'units', 'identifications']);
          this.cd.markForCheck();
        });
    }
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
