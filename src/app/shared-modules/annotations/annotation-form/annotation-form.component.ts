import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { MetadataService } from '../../../shared/service/metadata.service';
import { AnnotationService } from '../../../+viewer/service/annotation.service';
import { Observable } from 'rxjs';
import { Logger } from '../../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { mergeMap } from 'rxjs/operators';


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
  types = Annotation.TypeEnum;
  ownerTypes = [
    Annotation.AnnotationClassEnum.AnnotationClassNeutral,
    Annotation.AnnotationClassEnum.AnnotationClassAcknowledged
  ];

  emptyAnnotationClass = Annotation.AnnotationClassEnum.AnnotationClassNeutral;

  constructor(
    private metadataService: MetadataService,
    private annotationService: AnnotationService,
    private loggerService: Logger,
    private lajiApi: LajiApiService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.initAnnotation();
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
    })
      .map(data => data.map(item => {
        let groups = '';
        if (item.payload && item.payload.informalTaxonGroups) {
          groups = item.payload.informalTaxonGroups.reduce((prev, curr) => {
            return prev + ' ' + curr.id;
          }, groups);
        }
        item['groups'] = groups;
        return item;
      }));
  }

  ngOnChanges() {
    this.initAnnotation();
  }

  initAnnotation() {
    this.isEditor = this.editors && this.personID && this.editors.indexOf(this.personID) > -1;
    this.needsAck = this.annotations && this.annotations[0] && this.annotations[0].type !== Annotation.TypeEnum.TypeAcknowledged;
    if (!this.annotation.annotationClass) {
      this.annotation.annotationClass = this.emptyAnnotationClass;
    }
    this.annotationOptions$ = this.metadataService.getRange('MAN.annotationClassEnum')
      .map(annotationOptions => annotationOptions.filter(annotation => this.isEditor ?
          this.ownerTypes.indexOf(annotation.id) > -1 :
          ((
            this.ownerTypes.indexOf(annotation.id) === -1 ||
            annotation.id === Annotation.AnnotationClassEnum.AnnotationClassNeutral
          ) &&
           annotation.id !== Annotation.AnnotationClassEnum.AnnotationClassSpam)
          )
      );
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
