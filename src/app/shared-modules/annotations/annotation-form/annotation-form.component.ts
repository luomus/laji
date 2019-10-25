
import {map,  mergeMap } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, OnInit,
Output, ChangeDetectorRef, ElementRef, ViewChild, HostListener } from '@angular/core';
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
  @Input() visible;
  @Input() unit: any;
  @Output() success = new EventEmitter<Annotation>();
  @Output() cancel = new EventEmitter<any>();

  @ViewChild('taxon', {static: false}) taxonElement: ElementRef;
  @ViewChild('comment', {static: false}) commentElement: ElementRef;
  @ViewChild('annotationForm', {static: false}) formAnnotation: any;
  taxonAutocomplete: Observable<any>;
  error: any;
  unIdentifyable = false;
  isEditor: boolean;
  sending = false;
  infoModal = true;
  needsAck: boolean;
  annotationOptions$: Observable<{id: Annotation.AnnotationClassEnum, value: object}[]>;
  tagsAdd: Array<AnnotationTag>;
  tagsRemove: Array<AnnotationTag>;
  annotationAddadableTags$: Observable<AnnotationTag[]>;
  annotationRemovableTags$: Observable<AnnotationTag[]>;
  annotationAddadableTags: Subscription;
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
     return this.annotation.addedTags.indexOf(optionId) === -1; // add tags without control if positive or negative

     // add tags and filter after add a positive or negative tag
     /*if (this.annotation.addedTags.length === 0) {
      if (this.annotation.addedTags.indexOf(optionId) === -1) {
          return true;
        }
      } else {
        if (this.annotation.addedTags.indexOf(optionId) === -1) {
          if (this.findFirstTagNegativePositive(this.annotation.addedTags, Global.annotationTags) !== undefined ) {
            if ((Global.annotationTags[optionId].quality ===
              Global.annotationTags[this.findFirstTagNegativePositive(this.annotation.addedTags, Global.annotationTags)].quality) ||
            Global.annotationTags[optionId].quality === 'check' ||
            Global.annotationTags[optionId].quality === 'neutral') {
              return true;
            }
          } else {
            return true;
          }
        }
      }*/
  }

  disableTags(optionId: string): boolean {
        if (this.annotation.addedTags.indexOf(optionId) === -1) {
          if (this.findFirstTagNegativePositive(this.annotation.addedTags, Global.annotationTags) !== undefined ) {
            if ((Global.annotationTags[optionId].quality !==
              Global.annotationTags[this.findFirstTagNegativePositive(this.annotation.addedTags, Global.annotationTags)].quality) && (
            Global.annotationTags[optionId].quality !== 'check' &&
            Global.annotationTags[optionId].quality !== 'neutral')) {
              return true;
            }
          } else {
            return false;
          }
        }
  }

  // add tags and filter after add a positive or negative tag
  findFirstTagNegativePositive(tags, quality): any {
    for (let i = 0; i < tags.length; i++) {
      if (quality[tags[i]].quality !== 'check' && quality[tags[i]].quality !== 'neutral') {
        return tags[i];
      } else {
      }
    }
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
    this.annotationAddadableTags$ = this.annotationService.getAllAddableTags(this.translate.currentLang);
    this.annotationRemovableTags$ = this.annotationService.getAllRemovableTags(this.translate.currentLang);
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

  toggleInfo() {
    this.infoModal = !this.infoModal;
  }


  @HostListener('window:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {
      if (e.keyCode === 84 && e.altKey) { // alt + t --> focus input taxon
          this.taxonElement.nativeElement.focus();
      }

      if (e.keyCode === 67 && e.altKey) { // alt + c --> focus comment textarea
          this.commentElement.nativeElement.focus();
      }

      if (e.keyCode === 49 && e.altKey) { // alt + 1 --> add convincing
        if (this.showOption('MMAN.6') && this.annotationAddadableTags$.pipe(
          map((tags: AnnotationTag[]) => tags.findIndex(tag => tag.id === 'MMAN.6')))
        && this.personRoleAnnotation === Annotation.AnnotationRoleEnum.expert) {
          this.annotation.addedTags.push('MMAN.6');
        }
      }

      if (e.keyCode === 48 && e.altKey) { // alt + 0 --> add erroneus
        if (this.showOption('MMAN.9') && this.annotationAddadableTags$.pipe(
          map((tags: AnnotationTag[]) => tags.findIndex(tag => tag.id === 'MMAN.9')))
        && this.personRoleAnnotation === Annotation.AnnotationRoleEnum.expert) {
          this.annotation.addedTags.push('MMAN.9');
        }
      }

      if (e.keyCode === 82 && e.altKey) {
        this.annotation.addedTags = [];
        this.annotation.removedTags = [];
      }

      if (e.keyCode === 83 && e.ctrlKey) {
        if (this.formAnnotation.form.valid) {
          e.preventDefault();
          this.saveAnnotation();
        }
      }


  }

}
