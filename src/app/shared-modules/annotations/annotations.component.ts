import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnnotationService } from '../document-viewer/service/annotation.service';
import { Annotation } from '../../shared/model/Annotation';
import { IdService } from '../../shared/service/id.service';

@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.css']
})
export class AnnotationsComponent implements OnInit {
  @Input() rootID: string;
  @Input() targetID: string;
  @Input() editors: string[];
  @Input() personID: string;
  @Input() identifying = false;
  @Input() annotations: Annotation[] = [];
  @Output() close = new EventEmitter<any>();
  @Output() change = new EventEmitter<any>();
  error = false;
  adding = false;
  type: Annotation.TypeEnum;
  annotation: Annotation = {};

  constructor(private annotationService: AnnotationService) { }

  ngOnInit() {
    this.initEmptyAnnotation();
    if (this.identifying) {
      this.adding = true;
    }
  }

  initEmptyAnnotation() {
    this.annotation = {
      rootID: IdService.getId(this.rootID),
      targetID: IdService.getId(this.targetID),
      annotationClass: Annotation.AnnotationClassEnum.AnnotationClassNeutral,
      type: Annotation.TypeEnum.TypeOpinion
    };
  }

  toggleAddForm() {
    this.adding = !this.adding;
  }

  onSuccess(annotation: Annotation) {
    this.annotations = [annotation, ...this.annotations];
    this.saveDone(annotation);
  }

  closeAddForm() {
    this.adding = false;
  }

  onDelete(annotation: Annotation) {
    this.annotationService.delete(annotation)
      .subscribe(
        () => {
          this.annotations = this.annotations.filter(value => value.id !== annotation.id);
          this.saveDone();
        },
        (e) => console.log(e)
      );
  }

  private saveDone(annotation?: Annotation) {
    this.change.emit(annotation);
    this.closeAddForm();
    this.initEmptyAnnotation();
  }

}
