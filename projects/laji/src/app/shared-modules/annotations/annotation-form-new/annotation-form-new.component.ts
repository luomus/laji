import {map,  mergeMap, switchMap } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, OnInit,
Output, ChangeDetectorRef, ElementRef, ViewChild, HostListener,
ChangeDetectionStrategy, AfterContentChecked } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Annotation } from '../../../shared/model/Annotation';
import { AnnotationService } from '../../document-viewer/service/annotation.service';
import { Observable, Subscription } from 'rxjs';
import { Logger } from '../../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { Global } from '../../../../environments/global';
import { IdService } from '../../../shared/service/id.service';
import { LajiTaxonSearch } from '../../../shared/model/LajiTaxonSearch';
import { LabelPipe } from '../../../shared/pipe/label.pipe';
import { LoadingElementsService } from '../../document-viewer/loading-elements.service';
import { CheckFocusService } from '../../document-viewer/check-focus.service';
import { TaxonAutocompleteService } from '../../../shared/service/taxon-autocomplete.service';
import { InformalTaxonGroup } from '../../../shared/model/InformalTaxonGroup';
import { TypeaheadMatch } from '../../../../../../laji-ui/src/lib/typeahead/typeahead-match.class';
import { DialogService } from '../../../shared/service/dialog.service';

export interface AnnotationFormAnnotation extends Annotation {
  identification: Annotation.Identification;
  addedTags: string[];
  removedTags: string[];
}

interface AnnotationTaxonomy {
  id: string|null;
  qname: string|null;
  cursiveName: boolean;
  scientificName: string|null;
  vernacularName: string|null;
  scientificNameAuthorship: string|null;
}


@Component({
  selector: 'laji-annotation-form-new',
  templateUrl: './annotation-form-new.component.html',
  styleUrls: ['./annotation-form-new.component.scss'],
  providers: [LabelPipe],
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

  @Input() isEditor?: boolean;
  @Input() personID?: string;
  @Input() personRoleAnnotation?: Annotation.AnnotationRoleEnum;
  @Input() annotations?: Annotation[];
  @Input({ required: true }) annotation!: AnnotationFormAnnotation;
  @Input() identifying?: boolean;
  @Input({ required: true }) expert!: boolean;
  @Input() visible?: boolean;
  @Input() hidden?: boolean;
  @Input() unit: any;
  @Output() save = new EventEmitter<Annotation>();
  @Output() loading = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<any>();

  @ViewChild('taxon') taxonElement!: ElementRef;
  @ViewChild('comment') commentElement!: ElementRef;
  taxonAutocomplete?: Observable<any>;
  error: any;
  unIdentifyable = false;
  sending = false;
  needsAck?: boolean;
  annotationAddadableTags$!: Observable<AnnotationTag[]>;
  annotationRemovableTags$!: Observable<AnnotationTag[]>;
  annotationTaxonMatch$?: Observable<LajiTaxonSearch>;
  annotationSub?: Subscription;
  alertNotSpamVerified?: boolean;
  typeaheadLoading = false;
  types = Annotation.TypeEnum;
  selectedOptions: string[] = [];
  tmpTags?: Annotation[];
  isFocusedTaxonComment: any;
  inputType: any;
  inputName: any;
  taxonomy: AnnotationTaxonomy = {
    id: null,
    qname: null,
    cursiveName: true,
    scientificName: null,
    vernacularName: null,
    scientificNameAuthorship: null
  };
  currentTaxonName = '';
  annotationTagsObservation: Record<string, { value: string; quality: string; type: string }> = Global.annotationTags;
  annotationRole = Annotation.AnnotationRoleEnum;


  constructor(
    private annotationService: AnnotationService,
    private loggerService: Logger,
    private lajiApi: LajiApiService,
    private taxonApi: TaxonomyApi,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private labelPipe: LabelPipe,
    private loadingElements: LoadingElementsService,
    private focus: CheckFocusService,
    private taxonAutocompleteService: TaxonAutocompleteService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.initAnnotationTags();
    this.initCurrentTaxonName();
    this.taxonAutocomplete = Observable.create((observer: any) => {
      observer.next(this.annotation.identification.taxon);
    }).pipe(
      mergeMap((query: string) => this.getTaxa(query)),
      switchMap((taxa: any[]) => this.taxonAutocompleteService.getInfo(taxa, this.annotation.identification.taxon))
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
      map(data => data.map((item: any) => {
        let groups = '';
        if (item.payload && item.payload.informalTaxonGroups) {
          groups = item.payload.informalTaxonGroups.reduce((prev: string, curr: InformalTaxonGroup) => prev + ' ' + curr.id, groups);
        }
        item['groups'] = groups;
        return item;
      })));
  }

  public getMatchTaxon(taxonomy: string) {
    this.annotationTaxonMatch$ = this.taxonApi.taxonomySearch(taxonomy, '5', undefined, {matchType: 'exact'} );
    this.annotationSub = this.annotationTaxonMatch$.subscribe((result: any) => {
      result.forEach((taxon: any) => {
        if (taxon.matchingName.toLowerCase() === taxonomy.toLowerCase()) {
          this.annotation.identification.taxonID = taxon.id;
          this.taxonomy = taxon;
          this.cd.detectChanges();
          return;
        }
      });
    });
  }

  ngOnChanges() {
    this.initAnnotation();
  }

  select(event: TypeaheadMatch) {
    this.annotation.identification.taxonID = event.item.key;
    this.annotation.identification.taxon = event.item.autocompleteSelectedName;
    if (this.annotationSub) {
      this.annotationSub.unsubscribe();
    }
    this.taxonomy = {
      id: event.item.key,
      ...event.item.payload
    };
  }

  saveTaxon() {
    this.annotation.identification.taxonID = '';
    this.taxonomy = {
      id: null,
      qname: null,
      cursiveName: true,
      vernacularName: null,
      scientificName: null,
      scientificNameAuthorship: null,
    };
    if (this.annotation.identification.taxon !== '') {
      this.getMatchTaxon(this.annotation.identification.taxon);
    }
    this.cd.detectChanges();
  }

  cleanForm() {
    this.annotation.identification.taxon = '';
    this.annotation.identification.taxonID = '';
    this.taxonomy = {
      id: null,
      qname: null,
      cursiveName: true,
      vernacularName: null,
      scientificName: null,
      scientificNameAuthorship: null,
    };
    this.annotation.identification.taxonSpecifier = '';
    this.annotation.notes = '';
    this.annotation.removedTags = [];
    this.annotation.addedTags = [];
  }

  cleanTaxon() {
    this.annotation.identification.taxon = '';
    this.taxonomy = {
      id: null,
      qname: null,
      cursiveName: true,
      vernacularName: null,
      scientificName: null,
      scientificNameAuthorship: null,
    };
    this.annotation.identification.taxonSpecifier = '';
    this.cd.detectChanges();
  }

  // add tags and filter after add a positive or negative tag
  findFirstTagNegativePositive(tags: string[]): any {
    for (const tag of tags) {
      if (this.annotationTagsObservation[tag].quality !== 'MMAN.typeCheck' && this.annotationTagsObservation[tag].quality !== 'MMAN.typeInfo'
      && this.annotationTagsObservation[tag].quality !== 'MMAN.typeInvasive' && (this.annotationTagsObservation[tag].quality !== 'MMAN.typeAdmin' ||  tag === 'MMAN.3')) {
        return tag;
      } else {
      }
    }
  }

  verifyCurrentTaxon() {
    this.copyCurrentTaxon();
    if (!this.annotation.addedTags.includes('MMAN.5')) {
      this.addToAddTags({id: 'MMAN.5', quality: 'MMAN.typePositiveQuality'});
    }
  }

  initCurrentTaxonName() {
    if (this.unit.linkings && (this.unit.linkings.originalTaxon || this.unit.linkings.taxon)) {
      const taxon = this.unit.linkings.taxon || this.unit.linkings.originalTaxon;

      this.currentTaxonName = this.getLangCurrentTaxon(taxon.vernacularName, this.unit, this.translate.currentLang);
    }
  }

  copyCurrentTaxon() {
    if (this.unit.linkings && (this.unit.linkings.originalTaxon || this.unit.linkings.taxon)) {
      const taxon = this.unit.linkings.taxon || this.unit.linkings.originalTaxon;

      this.annotation.identification.taxon = this.getLangCurrentTaxon(taxon.vernacularName, this.unit, this.translate.currentLang);
      this.annotation.identification.taxonID = IdService.getId(taxon.id);
      this.taxonomy = {
        id: this.annotation.identification.taxonID,
        qname: null,
        cursiveName: true,
        vernacularName: taxon.vernacularName,
        scientificName: taxon.scientificName,
        scientificNameAuthorship: taxon.scientificNameAuthorship,
      };
      this.cd.detectChanges();
      this.inputName = 'opinion';
      this.inputType = 'blur';
    } else {
      return;
    }
  }

  getLangCurrentTaxon(value: any, unit: any, currentLang: string) {
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
      map(data => data.map(element => {
          if (element['id'] === 'MMAN.3') {
            return { id: element['id'], quality: element['type'] as any, position: 1 };
          } else {
            return { id: element['id'], quality: element['type'] as any, position: 0 };
          }
        }))
    );

    this.annotationRemovableTags$ = this.annotationService.getAllRemovableTags(this.translate.currentLang).pipe(
      map(
        data => data.filter(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          tag => this.labelPipe.transform((this.unit.interpretations.effectiveTags || []), 'warehouse').indexOf(tag['name']!) !== -1 )
        )
      );
  }


  initAnnotation() {
    this.needsAck = this.annotations && this.annotations[0] && this.annotations[0].type !== Annotation.TypeEnum.TypeAcknowledged;
  }

  filterBasicForm() {
    this.annotation.removedTags = [];
    this.annotation.identification.taxonSpecifier = '';
    this.annotation.addedTags = this.annotation.addedTags.filter(tag =>
      this.annotationTagsObservation[tag].type !== 'positive' && this.annotationTagsObservation[tag].type !== 'negative'
      && this.annotationTagsObservation[tag].type !== 'admin' && this.annotationTagsObservation[tag].type !== 'info'
    );
  }

  trySavingAnnotation() {
    if (this.expert && this.annotation.addedTags.includes('MMAN.9')) {
      this.dialogService.confirm(
        this.translate.instant('annotation.confirmErroneus', { taxonName: this.annotation.identification.taxon })
      ).subscribe(confirm => {
        if (confirm) {
          this.saveAnnotation();
        }
      });
    } else {
      this.saveAnnotation();
    }
  }

  saveAnnotation() {
    this.loading.emit(true);
    this.loadingElements.emitChildEvent(true);
    if (this.sending) {
      return;
    }
    this.sending = true;
    if (this.unIdentifyable) {
      this.annotation.type = Annotation.TypeEnum.TypeUnidentifiable;
    }

    if (!this.expert) {
    this.filterBasicForm();
    }

    if (this.expert && (this.annotation.addedTags.indexOf('MMAN.3') !== -1 || this.annotation.addedTags.indexOf('MMAN.5') !== -1)) {
      this.annotation.addedTags = this.annotation.addedTags.filter(tag => this.annotationTagsObservation[tag].type !== 'check');
    }


    this.annotationService
      .save(this.annotation)
      .subscribe(
        annotation => {
          this.annotation = annotation as AnnotationFormAnnotation;
          this.save.emit(annotation);
          this.sending = false;
        },
        error => {
          this.error = true;
          this.loggerService.error('Unable to save annotation', error);
          this.sending = false;
          this.loading.emit(false);
          this.loadingElements.emitChildEvent(false);
        }
      );
  }


  addToAddTags(value: { id: string; quality: string }) {
    if ( value.quality === 'MMAN.typePositiveQuality' || value.quality === 'MMAN.typeNegativeQuality' || value.id === 'MMAN.3') {
      const index = this.annotation.addedTags.indexOf(
        this.findFirstTagNegativePositive(this.annotation.addedTags)
      );
      const indexSame = this.annotation.addedTags.indexOf(value.id);
      if (index !== -1) {
        this.annotation.addedTags.splice(index, 1);
      }


      if (indexSame === -1 ) {
        this.annotation.addedTags.push(value.id);
        if ((value as any) === 'MMAN.3') { // TODO should be value.id ?
          this.removeAllTagsByCategory(this.annotation.addedTags, 'MMAN.typeCheck');
        }
      } else {

      }
      this.checkInsideRemovableTags(value);
    } else {
      const index = this.annotation.addedTags.indexOf(value.id);
      if (index > -1) {
        this.annotation.addedTags.splice(index, 1);
      } else {
        this.annotation.addedTags.push(value.id);
      }

      this.checkInsideRemovableTags(value);
    }


    this.annotation.addedTags = [...this.annotation.addedTags];
  }

  checkInsideRemovableTags(value: { id: string; quality: string }) {
    this.annotationRemovableTags$.subscribe(data => {
      this.tmpTags = data;
      if (this.annotation.addedTags.indexOf('MMAN.5') === -1 && this.annotation.addedTags.indexOf('MMAN.8') === -1
      && this.annotation.addedTags.indexOf('MMAN.9') === -1 && this.annotation.addedTags.indexOf('MMAN.3') === -1) {
        if (this.annotation.removedTags.indexOf('MMAN.5') !== -1 || this.annotation.removedTags.indexOf('MMAN.8') !== -1
        || this.annotation.removedTags.indexOf('MMAN.9') !== -1 || this.annotation.removedTags.indexOf('MMAN.3') !== -1) {
          this.tmpTags.forEach(tag => {
            if ((tag.id === 'MMAN.5' || tag.id === 'MMAN.8' || tag.id === 'MMAN.9' || tag.id === 'MMAN.3')) {
              this.addToRemoveTags(tag.id);
            }
          });
          if (this.annotation.removedTags.indexOf(value.id) !== -1) {
            this.addToRemoveTags(value.id);
          }
        }
        if (value.id === 'MMAN.3' || value.id === 'MMAN.5') {
          this.tmpTags.forEach(tag => {
            const tagId = tag.id as string;
            if (this.annotationTagsObservation[tagId].type === 'check' || this.annotationTagsObservation[tagId].type === 'info') {
                this.addToRemoveTags(tagId);
            }
          });
        }

      } else {
        this.tmpTags.forEach(tag => {
          const tagId = tag.id as string;
          if (tagId !== value.id) {
            if ((tagId === 'MMAN.5' || tagId === 'MMAN.8' || tagId === 'MMAN.9' || tagId === 'MMAN.3'
            || tagId === 'MMAN.50' || tagId === 'MMAN.51')
            && this.annotationTagsObservation[value.id].type !== 'check' && this.annotationTagsObservation[value.id].type !== 'info'
            && this.annotation.removedTags.indexOf(tagId) === -1 && this.annotation.addedTags.indexOf(tagId) === -1) {
              this.addToRemoveTags(tagId);
            }
            if ((this.annotationTagsObservation[tagId].type === 'check' || this.annotationTagsObservation[tagId].type === 'info' )
            && (value.id === 'MMAN.5' || value.id === 'MMAN.3') && this.annotation.removedTags.indexOf(tagId) === -1) {
              this.addToRemoveTags(tagId);
            }
          }
        });
        if (this.annotation.addedTags.indexOf('MMAN.5') !== -1 || this.annotation.addedTags.indexOf('MMAN.3') !== -1) {
          this.tmpTags.forEach(tag => {
            const tagId = tag.id as string;
            if ((this.annotationTagsObservation[tagId].type === 'check' || this.annotationTagsObservation[tagId].type === 'info' )
            && this.annotation.removedTags.indexOf(tagId) === -1) {
              this.addToRemoveTags(tagId);
            }
          });
        } else {

        }

        if (this.annotation.removedTags.indexOf(value.id) !== -1 &&
        (this.annotationTagsObservation[value.id].type === 'positive' || this.annotationTagsObservation[value.id].type === 'negative'
        || (this.annotationTagsObservation[value.id] as any) === 'admin' )) { // TODO should be this.annotationTagsObservation[value.id].type ?
          this.addToRemoveTags(value.id);
        }
      }
    });

  }


  removeAllTagsByCategory(array: string[], category: string) {
    let index = array.length - 1;
    while (index >= 0) {
      if (this.annotationTagsObservation[this.annotation.addedTags[index]].quality === category) {
        array.splice(index, 1);
      }

      index -= 1;
    }

  }

  addToRemoveTags(value: string) {
    const index = this.annotation.removedTags.indexOf(value);
    if (index > -1) {
      this.annotation.removedTags.splice(index, 1);
    } else {
      this.annotation.removedTags.push(value);
    }

    this.annotation.removedTags = [...this.annotation.removedTags];
  }

  disableSend(): boolean {
    this.alertNotSpamVerified = false;

    const checkTypeTagPasses = this.checkTypeTag();
    if (
    ((
      (this.annotation.notes === '' || this.annotation.notes === undefined) &&
      (this.annotation.addedTags.length === 0) &&
      (this.annotation.identification.taxon === '' || this.annotation.identification.taxon === undefined)) && this.annotation.removedTags.length === 0)
    ||
    (
      (this.annotation.identification.taxon === '' || this.annotation.identification.taxon === undefined) &&
      (this.annotation.addedTags.indexOf('MMAN.5') !== -1 || this.annotation.addedTags.indexOf('MMAN.8') !== -1 || this.annotation.addedTags.indexOf('MMAN.9') !== -1) &&
      (this.personRoleAnnotation === this.annotationRole.expert) && this.expert && !this.isEditor)
    ||
    ((((this.personRoleAnnotation === this.annotationRole.expert) && !this.expert) || (this.personRoleAnnotation === this.annotationRole.basic && this.expert)) &&
    ((this.annotation.addedTags.length === 0 || (this.annotation.addedTags.length === 1 && (this.annotation.addedTags.indexOf('MMAN.5') !== -1 ||
    this.annotation.addedTags.indexOf('MMAN.8') !== -1 || this.annotation.addedTags.indexOf('MMAN.9') !== -1)
    || (!checkTypeTagPasses)) || (this.annotation.addedTags.length > 1 && !checkTypeTagPasses)) &&
    (this.annotation.identification.taxon === '' || this.annotation.identification.taxon === undefined) &&
    (this.annotation.notes === '' || this.annotation.notes === undefined)))
    ) {
      return true;
    }
    return false;
  }

  checkTypeTag() {
    let count = 0;
    this.annotation.addedTags.forEach(tag => {
      if (this.annotationTagsObservation[tag].type === 'check') {
        count++;
      }
    });

    return count > 0;
  }

  onFocus(event: Event) {
    if (event) {
       this.inputType = event.type;
       this.inputName = (event.target as HTMLInputElement).name;
       this.isFocusedTaxonComment = event.target;
       this.focus.emitChildEvent(true);
    }
    this.cd.detectChanges();
  }

  onBlur(event: Event) {
    if (event) {
      this.inputType = event.type;
      this.inputName = (event.target as HTMLInputElement).name;
      this.isFocusedTaxonComment = null;
      this.focus.emitChildEvent(false);
   }
   this.cd.detectChanges();
  }

  initElements() {
    if (this.annotation.addedTags.indexOf('MMAN.3') !== -1) {
    this.initComment();
    }

  }

  initComment() {
    this.annotation.notes = this.translate.instant('annotation.isSpam');
  }


  @HostListener('document:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {
      if (e.keyCode === 84 && e.altKey) { // alt + t --> focus input taxon
          this.taxonElement?.nativeElement.focus();
      }

      if (e.keyCode === 67 && e.altKey) { // alt + c --> focus comment textarea
          this.commentElement?.nativeElement.focus();
      }

      if (this.expert && e.keyCode === 49 && e.altKey) { // alt + 1 --> add convincing
          this.addToAddTags({id: 'MMAN.5', quality: 'MMAN.typePositiveQuality'});
      }

      if (this.expert && e.keyCode === 48 && e.altKey) { // alt + 0 --> add erroneus
        this.addToAddTags({id: 'MMAN.8', quality: 'MMAN.typeNegativeQuality'});
      }

      if (e.keyCode === 82 && e.altKey) { // alt + r --> delete all added tags
        this.cleanForm();
      }

      if (e.altKey && e.keyCode === 83) { // alt + s --> save
        if ((this.annotation.notes !== '' && this.annotation.notes !== undefined) || this.annotation.addedTags.length > 0) {
          e.preventDefault();
          this.saveAnnotation();
        }
      }
  }



}

