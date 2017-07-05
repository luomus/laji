import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ViewChild } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { AnnotationService } from '../service/annotation.service';
import { Annotation } from '../../shared/model/Annotation';
import { Observable } from 'rxjs/Observable';
import { IdService } from '../../shared/service/id.service';

@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.css']
})
export class AnnotationsComponent implements OnInit {
  @ViewChild('childModal') public modal: ModalDirective;

  @Input() rootID: string;
  @Input() targetID: string;
  @Input() editors: string[];
  @Input() personID: string;
  @Output() close = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();
  error = false;
  adding = false;
  type: Annotation.TypeEnum;
  annotation: Annotation = {};
  annotation$: Observable<Annotation>;

  constructor(private annotationService: AnnotationService) { }

  ngOnInit() {
    this.updateAnnotationList();
    this.initEmptyAnnotation();
  }

  initEmptyAnnotation() {
    this.annotation = {
      rootID: IdService.getId(this.rootID),
      targetID: IdService.getId(this.targetID),
      annotationClass: Annotation.AnnotationClassEnum.AnnotationClassNeutral,
      type: Annotation.TypeEnum.TypeOpinion
    };
  }

  updateAnnotationList() {
    this.annotation$ = this.annotationService.getAllFromRoot(IdService.getId(this.rootID))
      .map(annotations => annotations.filter(annotation => annotation.targetID === IdService.getId(this.targetID)));
  }

  toggleAddForm() {
    this.adding = !this.adding;
  }

  onSuccess() {
    this.onChange.emit();
    this.closeAddForm();
    this.updateAnnotationList();
    this.initEmptyAnnotation();
  }

  closeAddForm() {
    this.adding = false;
  }

  onDelete(annotation: Annotation) {
    this.annotationService.delete(annotation)
      .subscribe(() => this.onSuccess());
  }

}
