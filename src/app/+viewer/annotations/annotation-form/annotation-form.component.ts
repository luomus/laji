import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { MetadataService } from '../../../shared/service/metadata.service';
import { OnChanges } from '@angular/core';
import { AnnotationService } from '../../service/annotation.service';

@Component({
  selector: 'laji-annotation-form',
  templateUrl: './annotation-form.component.html',
  styleUrls: ['./annotation-form.component.css']
})
export class AnnotationFormComponent implements OnInit, OnChanges {

  @Input() annotation: Annotation;
  @Output() success = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  error: any;
  annotationOptions$: any;

  private emptyAnnotationClass = Annotation.AnnotationClassEnum.AnnotationClassNeutral;

  constructor(
    private metadataService: MetadataService,
    private annotationService: AnnotationService
  ) { }

  ngOnInit() {
    this.annotationOptions$ = this.metadataService.getRange('MAN.annotationClassEnum', 'multi')
      .do(data => console.log(data));
    this.initAnnotation();
  }

  ngOnChanges() {
    this.initAnnotation();
  }

  initAnnotation() {
    if (!this.annotation.annotationClass) {
      this.annotation.annotationClass = this.emptyAnnotationClass;
    }
  }

  closeError() {

  }

  saveAnnotation() {
    this.annotationService
      .save(this.annotation)
      .subscribe(annotation => {
        this.annotation = annotation;
        this.success.emit(annotation);
      });
  }

}
