import { Component, ViewChild, OnInit, OnChanges, OnDestroy, SimpleChanges, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { UserService } from '../../shared/service/user.service';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';
import { SessionStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-document-local',
  templateUrl: './document-local.component.html',
  styleUrls: ['./document-local.component.css']
})
export class DocumentLocalComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(ViewerMapComponent) map: ViewerMapComponent;

  @Input() document: Document;
  @Input() useWorldMap = true;

  personID: string;
  active = 0;

  mapData: any[] = [];
  hasMapData = false;
  imageData: {[key: string]: any} = {};

  loadingFields = false;
  fields = {};

  @SessionStorage() showFacts = false;
  private metaFetch: Subscription;
  private imageFetches: Subscription[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private lajiApi: LajiApiService,
    private formService: FormService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.metaFetch = this.userService.action$
      .pipe(
        startWith(''),
        switchMap(() => this.userService.getUser())
      )
      .subscribe(person => {
        this.personID = person.id;
        this.cd.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.document) {
      this.setFields(this.document.formID);
      this.parseDocument(this.document);
      this.setActive(0);
    }
  }

  ngOnDestroy() {
    this.metaFetch.unsubscribe();
  }

  setActive(i) {
    this.active = i;
    if (this.map) {
      this.map.setActiveIndex(i);
    }
  }

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }

  private parseDocument(doc: Document) {
    for (let i = 0; i < this.imageFetches.length; i++) {
      if (this.imageFetches[i]) {
        this.imageFetches[i].unsubscribe();
      }
    }
    this.imageFetches = [];
    this.imageData = {};
    this.hasMapData = false;
    this.mapData = [];

    if (doc) {
      this.getImages(doc);

      doc.gatherings.map((gathering, i) => {
        if (gathering.geometry) {
          this.hasMapData = true;
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
    this.loadingFields = false;
    this.fields = {};

    this.formService.getFormInJSONFormat(formId, this.translate.currentLang)
      .subscribe(form => {
        this.setAllFields(form.fields, form.uiSchema, ['document', 'gatherings', 'units', 'identifications']);
        this.loadingFields = false;
        this.cd.markForCheck();
      });
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
