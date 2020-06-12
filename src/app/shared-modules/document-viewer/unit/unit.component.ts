import { ChangeDetectionStrategy, Component, Input, OnInit, Output,
EventEmitter} from '@angular/core';
import { ToQNamePipe } from '../../../shared/pipe/to-qname.pipe';
import { IdService } from '../../../shared/service/id.service';
import { AnnotationService } from '../service/annotation.service';
import { Annotation } from '../../../shared/model/Annotation';
import { DocumentViewerFacade } from '../document-viewer.facade';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';

@Component({
  selector: 'laji-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitComponent implements OnInit {

  @Input() editors: string[];
  @Input() personID: string;
  @Input() documentID: string;
  @Input() unit: any;
  @Input() highlight: string;
  @Input() highlightParents: string[] = [];
  @Input() identifying: boolean;
  @Input() openAnnotation: boolean;
  @Input() showFacts = false;
  @Input() showAnnotation: boolean;
  @Input() showOnlyHighlighted: boolean;
  @Input() annotationTags: AnnotationTag[]; 
  @Output() annotationPending = new EventEmitter<boolean>();

  annotationVisible = false;
  annotationIcon: string;
  annotations: Annotation[] = [];

  unitID: string;
  skipFacts: string[] = ['UnitGUID', 'InformalNameString'];

  constructor(
    private toQname: ToQNamePipe,
    private annotationService: AnnotationService,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  ngOnInit() {
    if (this.unit) {
      if (this.unit.linkings) {
        this.unit.linkings.taxonId = this.toQname.transform(this.unit.linkings.taxon.id);
      }
      if (Array.isArray(this.unit.facts)) {
        this.unit.facts = this.unit.facts.reduce((cumulative, current) => {
          if (this.skipFacts.indexOf(current.fact) !== -1) {
            return cumulative;
          }
          if (typeof current.value === 'string' && current.value.match(/^MX\.[0-9]+$/)) {
            current.value = IdService.getUri(current.value);
          }
          cumulative.push(current);
          return cumulative;
        }, []);
      }
      if (this.unit.unitId) {
        this.unitID = IdService.getId(this.unit.unitId);
      }
      this.initAnnotationStatus();
    }
  }

  initAnnotationStatus(annotation?: Annotation) {
    const annotations = this.unit.annotations || [];
    if (annotation) {
      if (!annotation.deleted) {
        annotations.push(annotation);
      }
      this.unit.annotations = annotations;
    }

    if (this.unit.annotations) {
      this.annotations = this.unit.annotations.reverse();
    }
    this.annotationVisible =
      this.openAnnotation ||
      this.highlight === this.unit.unitId ||
      (Array.isArray(this.annotations) && this.annotations.length > 0);
  }

  showAnnotations() {
    this.documentViewerFacade.showDocumentID({
      highlight: this.unit.unitId,
      document: this.documentID,
      openAnnotation: true,
      result: undefined
    });
  }

  hideAnnotations() {
    this.annotationVisible = false;
  }

}
