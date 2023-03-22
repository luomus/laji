import { Component, Input, OnInit, Output, EventEmitter, OnDestroy,
ChangeDetectionStrategy} from '@angular/core';
import { ToQNamePipe } from '../../../shared/pipe/to-qname.pipe';
import { IdService } from '../../../shared/service/id.service';
import { Annotation } from '../../../shared/model/Annotation';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';

@Component({
  selector: 'laji-unit-annotation-list',
  templateUrl: './unit-annotation-list.component.html',
  styleUrls: ['./unit-annotation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitAnnotationListComponent implements OnInit, OnDestroy {
  @Input() isEditor: boolean;
  @Input() personID: string;
  @Input() personRoleAnnotation: Annotation.AnnotationRoleEnum;
  @Input() documentID: string;
  @Input() unit: any;
  @Input() gathering: any;
  @Input() highlight: string;
  @Input() identifying: boolean;
  @Input() openAnnotation: boolean;
  @Input() showFacts = false;
  @Input() showAnnotation: boolean;
  @Input() annotationTags: AnnotationTag[];
  @Output() annotationPending = new EventEmitter<Record<string, unknown>>();

  annotationVisible = false;
  annotationIcon: string;
  annotations: Annotation[] = [];
  unitID: string;
  skipFacts: string[] = ['UnitGUID', 'InformalNameString'];
  checkloading = {
    status: false,
    action: undefined
  };

  constructor(
    private toQname: ToQNamePipe
  ) { }

  ngOnInit() {
    if (this.unit) {
      if (this.unit.linkings) {
        this.unit.linkings.taxonId = this.toQname.transform(this.unit.linkings.taxon.qname);
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

  toggleAnnotations() {
    this.annotationVisible = !this.annotationVisible;
  }

  hideAnnotations() {
    this.annotationVisible = false;
  }

  checkLoading(event: any) {
    this.checkloading = event;
    this.annotationPending.emit(this.checkloading);
  }

  ngOnDestroy() {
    setTimeout(() => {
      this.annotationPending.emit({status: false, action: this.checkloading.action });
    }, 2000);
  }



}
