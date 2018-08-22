import { Component, ViewChild, OnInit, OnChanges, OnDestroy, SimpleChanges, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { UserService } from '../../shared/service/user.service';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';

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
  activeGathering: any;

  mapData = [];
  hasMapData = false;
  documentImageData: any;
  gatheringImageData = [];

  documentFields: any[];
  gatheringsFields: any[];
  unitsFields: any[];
  identificationsFields: any[];

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
    if (this.document && this.document.gatherings) {
      this.activeGathering = this.document.gatherings[i] || undefined;
    }
    if (this.map) {
      this.map.setActiveIndex(i);
    }
  }

  private parseDocument(doc: Document) {
    console.log(doc);
    for (let i = 0; i < this.imageFetches.length; i++) {
      if (this.imageFetches[i]) {
        this.imageFetches[i].unsubscribe();
      }
    }
    this.imageFetches = [];
    this.documentImageData = undefined;
    this.gatheringImageData = [];
    this.hasMapData = false;
    this.mapData = [];

    if (doc) {
      if (doc.images && doc.images.length > 0) {
        this.imageFetches.push(
          this.getImages(doc.images)
            .subscribe((res) => {
              this.documentImageData = res.results;
            })
        );
      }

      doc.gatherings.map((gathering, i) => {
        if (gathering.geometry) {
          this.hasMapData = true;
          this.mapData[i] = gathering.geometry;
        }
        if (gathering.images && gathering.images.length > 0) {
          this.imageFetches.push(
            this.getImages(gathering.images)
              .subscribe((res) => {
                this.gatheringImageData[i] = res.results;
              })
          );
        }
      });
    }
  }

  private getImages(idList: string[]) {
    return this.lajiApi.getList(LajiApi.Endpoints.images, {
      lang: this.translate.currentLang,
      page: 1,
      pageSize: 1000,
      idIn: idList.join(',')
    });
  }

  private setFields(formId: string) {
    this.documentFields = undefined;
    this.gatheringsFields = undefined;
    this.unitsFields = undefined;
    this.identificationsFields = undefined;

    this.formService.getFormInJSONFormat(formId, this.translate.currentLang)
      .subscribe(form => {
        console.log(form);
        this.setAllFields(form.fields, ['document', 'gatherings', 'units', 'identifications']);
      });
  }

  private setAllFields(fields: any[], fieldNames: string[]) {
    this[fieldNames[0] + 'Fields'] = fields;
    fieldNames = fieldNames.slice(1);

    if (fieldNames.length < 1) {
      return;
    }

    for (let i = 0; i < fields.length; i++) {
      if (fields[i].name === fieldNames[0]) {
        this.setAllFields(fields[i].fields, fieldNames);
      }
    }
  }
}
