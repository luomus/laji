
import {map,  mergeMap } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { MetadataService } from '../../../shared/service/metadata.service';
import { AnnotationService } from '../../document-viewer/service/annotation.service';
import { Observable, Subscription } from 'rxjs';
import { Logger } from '../../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { Global } from '../../../../environments/global';
import { format } from 'd3-format';


@Component({
  selector: 'laji-annotation-form',
  templateUrl: './annotation-form.component.html',
  styleUrls: ['./annotation-form.component.css']
})
export class AnnotationFormComponent implements OnInit, OnChanges {
  static readonly lang = ['en', 'fi', 'sv'];

  @Input() editors: string[];
  @Input() personID: string;
  @Input() personRoleAnnotation: Annotation.AnnotationRoleEnum;
  @Input() annotations: Annotation[];
  @Input() annotation: Annotation;
  @Input() identifying: boolean;
  @Input() expert: boolean;
  @Input() unit: any;
  @Output() success = new EventEmitter<Annotation>();
  @Output() cancel = new EventEmitter<any>();

  @ViewChild('taxon', {static: false}) taxonElement: ElementRef;
  @ViewChild('annotationForm', {static: false}) formAnnotation: any;
  taxonAutocomplete: Observable<any>;
  error: any;
  unIdentifyable = false;
  isEditor: boolean;
  sending = false;
  needsAck: boolean;
  annotationOptions$: Observable<{id: Annotation.AnnotationClassEnum, value: object}[]>;
  tagsAdd: Array<AnnotationTag>;
  tagsRemove: Array<AnnotationTag>;
  annotationAddadableTags: Subscription;
  annotationRemovableTags: Subscription;
  types = Annotation.TypeEnum;
  selectedOptions: string[] = [];
  deletedOptions: string[] = [];
  ownerTypes = [
    Annotation.AnnotationClassEnum.AnnotationClassNeutral,
    Annotation.AnnotationClassEnum.AnnotationClassAcknowledged
  ];

  emptyAnnotationClass = Annotation.AnnotationClassEnum.AnnotationClassNeutral;
  annotationTagsObservation = Global.annotationTags;
  annotationRole = Annotation.AnnotationRoleEnum;


  constructor(
    private metadataService: MetadataService,
    private annotationService: AnnotationService,
    private loggerService: Logger,
    private lajiApi: LajiApiService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.taxonAutocomplete = Observable.create((observer: any) => {
      observer.next(this.annotation.identification.taxon);
    }).pipe(
      mergeMap((query: string) => this.getTaxa(query))
    );
  }

  public getTaxa(token: string): Observable<any> {
    return this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'taxon', {
      q: token,
      limit: '10',
      includePayload: true,
      lang: this.translate.currentLang
    }).pipe(
      map(data => data.map(item => {
        let groups = '';
        if (item.payload && item.payload.informalTaxonGroups) {
          groups = item.payload.informalTaxonGroups.reduce((prev, curr) => {
            return prev + ' ' + curr.id;
          }, groups);
        }
        item['groups'] = groups;
        return item;
      })));
  }

  ngOnChanges() {
    this.initAnnotation();
    this.initAnnotationTags();
  }

  onChangeSelectBox(event: any, option, index) {
    const value: string = event.target.value;
    if (value === '') {
      return;
    }

    if (option === 'added') {
      if (this.annotation.addedTags.indexOf(value) === -1) {
        this.annotation.addedTags.push(value);
      }
    } else {
      if (this.annotation.removedTags.indexOf(value) === -1) {
        this.annotation.removedTags.push(value);
      }
    }
  }

  deleteSelected(array, item) {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  showOption(optionId: string): boolean {
      return this.annotation.addedTags.indexOf(optionId) === -1;
  }

  showOptionDeleted(optionId: string): boolean {
    return this.annotation.removedTags.indexOf(optionId) === -1;
  }

  copyCurrentTaxon() {
    if (this.unit.linkings && (this.unit.linkings.originalTaxon || this.unit.linkings.taxon)) {
      if (this.unit.linkings.taxon) {
        this.taxonElement.nativeElement.focus();
        this.annotation.identification.taxon = this.getLangCurrentTaxon(
          this.unit.linkings.taxon.vernacularName, this.unit, this.translate.currentLang
          );
          this.cd.detectChanges();
          this.formAnnotation.control.markAsDirty();
      } else {
        this.taxonElement.nativeElement.focus();
        this.annotation.identification.taxon = this.getLangCurrentTaxon(
          this.unit.linkings.originalTaxon.vernacularName, this.unit, this.translate.currentLang
          );
          this.cd.detectChanges();
          this.formAnnotation.control.markAsDirty();
      }
    } else {
      return;
    }
  }


  getLangCurrentTaxon(value, unit, currentLang) {
    if (value) {
      if (value[currentLang]) {
        return value[currentLang];
      } else {
        for (const item of AnnotationFormComponent.lang) {
          if (item !== currentLang) {
            if (value[item]) {
              return value[item];
            }
          }
        }
      }
    } else {
      return unit.taxonVerbatim;
    }
  }



  initAnnotationTags() {
    this.annotationAddadableTags = this.annotationService.getAllAddableTags(this.translate.currentLang)
    .subscribe(
      (resultArray: AnnotationTag[]) => {
        this.tagsAdd = resultArray;
      },
      error => console.log('Error :: ' + error)
    );


    this.annotationRemovableTags = this.annotationService.getAllRemovableTags(this.translate.currentLang)
    .subscribe(
      (resultArray: AnnotationTag[]) => {
        this.tagsRemove = resultArray;
      },
      error => console.log('Error :: ' + error)
    );

  }


  initAnnotation() {
    this.isEditor = this.editors && this.personID && this.editors.indexOf(this.personID) > -1;
    this.needsAck = this.annotations && this.annotations[0] && this.annotations[0].type !== Annotation.TypeEnum.TypeAcknowledged;
    this.annotationOptions$ = this.metadataService.getRange('MAN.annotationClassEnum').pipe(
      map(annotationOptions => annotationOptions.filter(annotation => this.isEditor ?
          this.ownerTypes.indexOf(annotation.id) > -1 :
          ((
            this.ownerTypes.indexOf(annotation.id) === -1 ||
            annotation.id === Annotation.AnnotationClassEnum.AnnotationClassNeutral
          ) &&
           annotation.id !== Annotation.AnnotationClassEnum.AnnotationClassSpam)
          )
      ));
  }

  closeError() {
    this.error = false;
  }

  saveAnnotation() {
    if (this.sending) {
      return;
    }
    this.sending = true;
    if (this.unIdentifyable) {
      this.annotation.type = Annotation.TypeEnum.TypeUnidentifiable;
    }

    if (!this.expert) {
    this.annotation.removedTags = [];
    }

    this.annotationService
      .save(this.annotation)
      .subscribe(
        annotation => {
          this.annotation = annotation;
          this.success.emit(annotation);
          this.sending = false;
          this.formAnnotation.control.markAsPristine();
        },
        error => {
          this.error = true;
          this.loggerService.error('Unable to save annotation', error);
          this.sending = false;
        }
      );
  }

}
