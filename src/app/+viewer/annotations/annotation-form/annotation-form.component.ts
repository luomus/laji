import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { MetadataService } from '../../../shared/service/metadata.service';
import { OnChanges } from '@angular/core';
import { AnnotationService } from '../../service/annotation.service';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../../../shared/logger/logger.service';

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
  @Output() success = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  error: any;
  isEditor: boolean;
  needsAck: boolean;
  annotationOptions$: Observable<{id: Annotation.AnnotationClassEnum, value: object}[]>;
  types = Annotation.TypeEnum;
  newName = [
    Annotation.AnnotationClassEnum.AnnotationClassSuspicious,
    Annotation.AnnotationClassEnum.AnnotationClassUnreliable
  ];

  private emptyAnnotationClass = Annotation.AnnotationClassEnum.AnnotationClassNeutral;

  constructor(
    private metadataService: MetadataService,
    private annotationService: AnnotationService,
    private loggerService: Logger
  ) { }

  ngOnInit() {
    this.annotationOptions$ = this.metadataService.getRange('MAN.annotationClassEnum', 'multi');
    this.initAnnotation();
  }

  ngOnChanges() {
    this.initAnnotation();
  }

  initAnnotation() {
    this.isEditor = this.editors && this.editors.indexOf(this.personID) > -1;
    this.needsAck = this.annotations && this.annotations[0] && this.annotations[0].type !== Annotation.TypeEnum.TypeAcknowledged;
    if (!this.annotation.annotationClass) {
      this.annotation.annotationClass = this.emptyAnnotationClass;
    }
  }

  closeError() {
    this.error = false;
  }

  saveAnnotation() {
    this.annotationService
      .save(this.annotation)
      .subscribe(
        annotation => {
          this.annotation = annotation;
          this.success.emit(annotation);
        },
        error => {
          this.error = true;
          this.loggerService.error('Unable to save annotation', error);
        }
      );
  }

}
