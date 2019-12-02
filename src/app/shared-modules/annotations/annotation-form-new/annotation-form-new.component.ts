import {map,  mergeMap } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, OnInit,
Output, ChangeDetectorRef, ElementRef, ViewChild, HostListener,
ChangeDetectionStrategy, AfterContentChecked } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Annotation } from '../../../shared/model/Annotation';
import { MetadataService } from '../../../shared/service/metadata.service';
import { AnnotationService } from '../../document-viewer/service/annotation.service';
import { Observable, Subscription } from 'rxjs';
import { Logger } from '../../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { Global } from '../../../../environments/global';
import { format } from 'd3-format';
import { IdService } from '../../../shared/service/id.service';
import { LajiTaxonSearch } from '../../../shared/model/LajiTaxonSearch';

@Component({
  selector: 'laji-annotation-form-new',
  templateUrl: './annotation-form-new.component.html',
  styleUrls: ['./annotation-form-new.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition('void => *', [
        style({opacity: 0}),
        animate(400, style({opacity: 1}))
      ]),
      transition('* => void', [
        animate(600, style({opacity: 0}))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AnnotationFormNewComponent implements OnInit , OnChanges, AfterContentChecked {
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
  annotationTaxonMatch$: Observable<LajiTaxonSearch>;
  annotationAddadableTags: Subscription;
  alertNotSpamVerified: boolean;
  typeaheadLoading = false;
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
    private taxonApi: TaxonomyApi,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.initAnnotationTags();
    this.taxonAutocomplete = Observable.create((observer: any) => {
      observer.next(this.annotation.identification.taxon);
    }).pipe(
      mergeMap((query: string) => this.getTaxa(query))
    );
  }

  ngAfterContentChecked() {
    this.cd.detectChanges();
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

  public getMatchTaxon(taxonomy: string) {
    this.annotationTaxonMatch$ = this.taxonApi.taxonomySearch(taxonomy, '5', undefined, {matchType: 'exact'} );
    this.annotationTaxonMatch$.subscribe((result: any) => {
      result.forEach(taxon => {
        if (taxon.matchingName.toLowerCase() === taxonomy.toLowerCase()) {
          this.annotation.identification.taxonID = taxon.id;
          return;
        }
      });
    });
  }

  ngOnChanges() {
    this.initAnnotation();
  }

  select(event) {
    this.annotation.identification.taxonID = event.item.key;
    this.annotation.identification.taxon = event.value;
  }

  saveTaxon(event) {
    this.annotation.identification.taxonID = '';
    this.getMatchTaxon(this.annotation.identification.taxon);
  }

  deleteSelected(id) {
    this.cd.detectChanges();
    if (this.expert) {
      this.cleanForm();
    } else {
      const index = this.annotation.addedTags.indexOf(id);
      this.annotation.addedTags.splice(index, 1);
      if (this.annotation.addedTags.length === 0) {
        this.cleanForm();
      }
    }
  }

  cleanForm() {
    this.annotation.identification.taxon = '';
    this.annotation.identification.taxonID = '';
    this.annotation.identification.taxonSpecifier = '';
    this.annotation.notes = '';
    this.annotation.removedTags = [];
    this.annotation.addedTags = [];
  }

  showOption(optionId: string): boolean {
     return this.annotation.addedTags.indexOf(optionId) === -1; // add tags without control if positive or negative
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

  showOnlyPositiveNegative(id) {
   return Global.annotationTags[id].quality !== 'neutral' && (Global.annotationTags[id].quality !== 'check' ||
   Global.annotationTags[id].value === 'MMAN.11') && Global.annotationTags[id].quality !== 'self';
  }

  showOnlyCheck(id) {
    return Global.annotationTags[id].quality === 'check' && Global.annotationTags[id].value !== 'MMAN.11';
   }

  showOptionDeleted(optionId: string): boolean {
    return this.annotation.removedTags.indexOf(optionId) === -1;
  }

  copyCurrentTaxon() {
    if (this.unit.linkings && (this.unit.linkings.originalTaxon || this.unit.linkings.taxon)) {
      if (this.unit.linkings.taxon) {
        this.annotation.identification.taxon = this.getLangCurrentTaxon(
          this.unit.linkings.taxon.vernacularName, this.unit, this.translate.currentLang
          );
          this.annotation.identification.taxonID =  IdService.getId(this.unit.linkings.taxon.id);
          this.cd.detectChanges();
          this.formAnnotation.control.markAsDirty();
      } else {
        this.annotation.identification.taxon = this.getLangCurrentTaxon(
          this.unit.linkings.originalTaxon.vernacularName, this.unit, this.translate.currentLang
          );
          this.annotation.identification.taxonID =  IdService.getId(this.unit.linkings.originalTaxon.id);
          this.cd.detectChanges();
          this.formAnnotation.control.markAsDirty();
      }
    } else {
      return;
    }
  }

  initComment() {
    this.annotation.notes = this.translate.instant('annotation.isSpam');
  }


  getLangCurrentTaxon(value, unit, currentLang) {
    if (value) {
      if (value[currentLang]) {
        return value[currentLang];
      } else {
        for (const item of AnnotationFormNewComponent.lang) {
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
    this.annotationAddadableTags$ = this.annotationService.getAllAddableTags(this.translate.currentLang).pipe(
      map(data => {
        return data.map(element => {
          if (element['id'] === 'MMAN.3') {
            return { id: element['id'], quality: this.annotationTagsObservation[element.id].quality, position: 1 };
          } else {
            return { id: element['id'], quality: this.annotationTagsObservation[element.id].quality, position: 0 };
          }
        });
      })
    );

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

  addToAddTags(value) {

    if ( this.annotationTagsObservation[value].quality === 'positive' || this.annotationTagsObservation[value].quality === 'negative') {
      const index = this.annotation.addedTags.indexOf(
        this.findFirstTagNegativePositive(this.annotation.addedTags, this.annotationTagsObservation)
      );
      const index_same = this.annotation.addedTags.indexOf(value);
      if (index !== -1) {
        this.annotation.addedTags.splice(index, 1);
      }

      if (index_same === -1 ) {
        this.annotation.addedTags.push(value);
        if (value === 'MMAN.3') {
          this.removeAllTagsByCategory(this.annotation.addedTags, 'check');
        }
      } else {
        // this.annotation.addedTags.push(value);
      }

      /*if (value === 'MMAN.3') {
        this.removeAllcheckTags();
      }*/
    } else {
      const index = this.annotation.addedTags.indexOf(value);
      if (index > -1) {
        this.annotation.addedTags.splice(index, 1);
      } else {
        this.annotation.addedTags.push(value);
      }
    }
    this.annotation.addedTags = [...this.annotation.addedTags];
  }


  removeAllTagsByCategory(array, category) {
    let index = array.length - 1;
    while (index >= 0) {
      if (this.annotationTagsObservation[this.annotation.addedTags[index]].quality === category) {
        array.splice(index, 1);
      }

      index -= 1;
    }

  }

  addToRemoveTags(value) {
    const index = this.annotation.removedTags.indexOf(value);
    if (index > -1) {
      this.annotation.removedTags.splice(index, 1);
    } else {
      this.annotation.removedTags.push(value);
    }

    this.annotation.removedTags = [...this.annotation.removedTags];
  }


  initElements() {
    /*if (this.annotation.addedTags.indexOf('MMAN.5') !== -1 ) {
      this.copyCurrentTaxon();
    }*/

    if (this.annotation.addedTags.indexOf('MMAN.3') !== -1 ) {
      this.initComment();
    }

  }

  checkAddTags(id) {
    return (this.expert && this.annotation.addedTags.length > 0) || (!this.expert && this.annotation.addedTags.indexOf(id) !== -1);
  }

  disableSend() {
    this.alertNotSpamVerified = false;

    /*if (this.annotation.addedTags.length === 0) {
      return true;
    } else {
      if (this.annotation.addedTags.indexOf('MMAN.5') === -1 && this.annotation.addedTags.indexOf('MMAN.3') === -1 ) {

      } else {
      }
    }*/

    if ((this.annotation.notes === '' || this.annotation.notes === undefined) && this.annotation.addedTags.length === 0 &&
    (this.annotation.identification.taxon === '' || this.annotation.identification.taxon === undefined)) {
      return true;
    }
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
          this.addToAddTags('MMAN.6');
      }

      if (e.keyCode === 48 && e.altKey) { // alt + 0 --> add erroneus
        this.addToAddTags('MMAN.9');
      }

      if (e.keyCode === 82 && e.altKey) { // alt + r --> delete all added tags
        this.annotation.addedTags = [];
      }

      if (e.altKey && e.keyCode === 83) { // alt + s --> save
        if ((this.annotation.notes !== '' && this.annotation.notes !== undefined) || this.annotation.addedTags.length > 0) {
          e.preventDefault();
          this.saveAnnotation();
        }
      }
  }



}

