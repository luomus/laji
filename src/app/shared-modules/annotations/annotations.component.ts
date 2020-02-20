import { Component, EventEmitter, Input, OnInit, Output, ViewChild,
ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AnnotationService } from '../document-viewer/service/annotation.service';
import { Annotation } from '../../shared/model/Annotation';
import { IdService } from '../../shared/service/id.service';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';
import { AnnotationFormNewComponent } from './annotation-form-new/annotation-form-new.component';

@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush

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
  @Input() gathering: any;
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
    private documentViewerFacade: DocumentViewerFacade,
    private cd: ChangeDetectorRef
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
        taxonID: '',
        taxonSpecifier: ''
      },
      addedTags: [],
      removedTags: [],
      deleted: false,
      type: Annotation.TypeEnum.TypeOpinion,
      occurrenceAtTimeOfAnnotation: {
        countryVerbatim: this.gathering && this.gathering.country ? this.gathering.country : '',
        dateBegin: this.gathering && this.gathering.eventDate && this.gathering.eventDate.begin ? this.gathering.eventDate.begin : '',
        dateEnd: this.gathering && this.gathering.eventDate && this.gathering.eventDate.end ? this.gathering.eventDate.end : '',
        locality: this.gathering && this.gathering.locality ? this.gathering.locality : '',
        municipalityVerbatim: this.gathering && this.gathering.municipalityVerbatim ? this.gathering.municipalityVerbatim : '',
        taxonId : this.unit && this.unit.linkings && this.unit.linkings.originalTaxon ? this.unit.linkings.originalTaxon.id : '' ,
        taxonVerbatim: this.unit && this.unit.taxonVerbatim ? this.unit.taxonVerbatim : '',
        wgs84centerPointLat: this.gathering && this.gathering.conversions && this.gathering.conversions.wgs84CenterPoint ?
        this.gathering.conversions.wgs84CenterPoint.lat : '',
        wgs84centerPointLon: this.gathering && this.gathering.conversions.wgs84CenterPoint ?
        this.gathering.conversions.wgs84CenterPoint.lon : ''
      }
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
   this.cd.markForCheck();
  }

  onDelete(annotation: Annotation) {
    this.annotationService.delete(annotation)
      .subscribe(
        () => {
          // this.annotations = this.annotations.filter(value => value.id !== annotation.id);
          console.log(this.annotation);
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
      openAnnotation: true,
      result: undefined
    });
  }

}
