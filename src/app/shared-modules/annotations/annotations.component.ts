import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AnnotationService } from '../document-viewer/service/annotation.service';
import { Annotation } from '../../shared/model/Annotation';
import { IdService } from '../../shared/service/id.service';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';
import { AnnotationFormNewComponent } from './annotation-form-new/annotation-form-new.component';

@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.css']
})
export class AnnotationsComponent implements OnInit {
  @Input() rootID: string;
  @Input() targetID: string;
  @Input() documentID: string;
  @Input() editors: string[];
  @Input() personID: string;
  @Input() personRoleAnnotation: Annotation.AnnotationRoleEnum;
  @Input() identifying = false;
  @Input() unit: any;
  @Input() annotations: Annotation[] = [];
  @Input() formVisible: boolean;
  @Output() close = new EventEmitter<any>();
  @Output() annotationChange = new EventEmitter<Annotation>();

  @ViewChild('formAnnotation', {static: false}) formAnnotation: AnnotationFormNewComponent;
  error = false;
  adding = false;
  expert = true;
  type: Annotation.TypeEnum;
  annotation: Annotation = {};
  annotationRole = Annotation.AnnotationRoleEnum;

  constructor(
    private annotationService: AnnotationService,
    private documentViewerFacade: DocumentViewerFacade
    ) { }

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
      identification: {
        taxon: '',
        taxonSpecifier: ''
      },
      addedTags: [],
      removedTags: [],
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

  changeModeForm() {
   this.expert = !this.expert;
   this.formAnnotation.cleanForm();
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
    this.annotationChange.emit(annotation);
    this.closeAddForm();
    this.initEmptyAnnotation();
  }

  showDocument() {
      this.documentViewerFacade.showDocumentID({
        highlight: this.unit.unitId,
        document: this.documentID,
        openAnnotation: true
      });
  }

}
