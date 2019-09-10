
import {map,  mergeMap } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { MetadataService } from '../../../shared/service/metadata.service';
import { AnnotationService } from '../../document-viewer/service/annotation.service';
import { Observable, Subscription } from 'rxjs';
import { Logger } from '../../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { Global } from '../../../../environments/global';


@Component({
  selector: 'laji-annotation-form',
  templateUrl: './annotation-form.component.html',
  styleUrls: ['./annotation-form.component.css']
})
export class AnnotationFormComponent implements OnInit, OnChanges {

  @Input() editors: string[];
  @Input() personID: string;
  @Input() annotations: Annotation[];
  @Input() annotation: Annotation;
  @Input() identifying: boolean;
  @Output() success = new EventEmitter<Annotation>();
  @Output() cancel = new EventEmitter<any>();

  taxonAutocomplete: Observable<any>;
  error: any;
  unIdentifyable = false;
  isEditor: boolean;
  sending = false;
  needsAck: boolean;
  annotationOptions$: Observable<{id: Annotation.AnnotationClassEnum, value: object}[]>;
  tags: Array<AnnotationTag>;
  annotationTags: Subscription;
  types = Annotation.TypeEnum;
  selectedOptions: string[] = [];
  deletedOptions: string[] = [];
  ownerTypes = [
    Annotation.AnnotationClassEnum.AnnotationClassNeutral,
    Annotation.AnnotationClassEnum.AnnotationClassAcknowledged
  ];

  emptyAnnotationClass = Annotation.AnnotationClassEnum.AnnotationClassNeutral;

  annotationTagsObservation = Global.annotationTags;

  constructor(
    private metadataService: MetadataService,
    private annotationService: AnnotationService,
    private loggerService: Logger,
    private lajiApi: LajiApiService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log(this.annotations);
    this.initAnnotationTags();
    this.taxonAutocomplete = Observable.create((observer: any) => {
      observer.next(this.annotation.opinion);
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
      if (this.selectedOptions.indexOf(value) === -1) {
        this.selectedOptions.push(value);
        this.tags.splice(index, 1);
      }
    } else {
      if (this.deletedOptions.indexOf(value) === -1) {
        this.deletedOptions.push(value);
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
      return this.selectedOptions.indexOf(optionId) === -1;
  }

  showOptionDeleted(optionId: string): boolean {
    return this.deletedOptions.indexOf(optionId) === -1;
}



  initAnnotationTags() {
    if (this.annotationTags) {
      return;
    }


    this.annotationTags = this.lajiApi.getList(LajiApi.Endpoints.annotationsTags,
    {lang: this.translate.currentLang}).subscribe(listTags => {
    this.tags = listTags;
    this.cd.markForCheck();
    });
  }

  initAnnotation() {
    this.isEditor = this.editors && this.personID && this.editors.indexOf(this.personID) > -1;
    this.needsAck = this.annotations && this.annotations[0] && this.annotations[0].type !== Annotation.TypeEnum.TypeAcknowledged;
    if (!this.annotation.annotationClass) {
      this.annotation.annotationClass = this.emptyAnnotationClass;
    }
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
      delete this.annotation.annotationClass;
    }
    this.annotationService
      .save(this.annotation)
      .subscribe(
        annotation => {
          this.annotation = annotation;
          this.success.emit(annotation);
          this.sending = false;
        },
        error => {
          this.error = true;
          this.loggerService.error('Unable to save annotation', error);
          this.sending = false;
        }
      );
  }

}
