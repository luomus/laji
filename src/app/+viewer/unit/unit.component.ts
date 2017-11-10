import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { IdService } from '../../shared/service/id.service';
import { AnnotationService } from '../service/annotation.service';
import { Observable } from 'rxjs/Observable';
import { Annotation } from '../../shared/model/Annotation';

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
  @Input() identifying: boolean;
  @Input() openAnnotation: boolean;
  @Input() showFacts = false;

  annotationVisible = false;
  annotationClass$: Observable<string>;
  annotationIcon: string;
  annotations: Annotation[] = [];

  unitID: string;
  skipFacts: string[] = ['UnitGUID', 'InformalNameString'];
  annotationClass = Annotation.AnnotationClassEnum;

  constructor(
    private toQname: ToQNamePipe,
    private annotationService: AnnotationService
  ) { }

  ngOnInit() {
    if (this.unit) {
      if (this.unit.linkings) {
        this.unit.linkings.taxonId = this.toQname.transform(this.unit.linkings.taxon.qname);
      }
      if (this.unit.facts) {
        this.unit.facts = this.unit.facts.filter(item => this.skipFacts.indexOf(item.fact) === -1);
      }
      if (this.unit.unitId) {
        this.unitID = IdService.getId(this.unit.unitId);
      }
      this.initAnnotationStatus();
    }
  }

  initAnnotationStatus() {
    this.annotationClass$ = this.annotationService
      .getAnnotationClassInEffect(this.unit.annotations)
      .map(annotationClass => {
        this.annotationIcon = annotationClass ? 'fa-comments' : 'fa-comment-o';
        switch (annotationClass) {
          case Annotation.AnnotationClassEnum.AnnotationClassUnreliable:
          case Annotation.AnnotationClassEnum.AnnotationClassSuspicious:
          case Annotation.AnnotationClassEnum.AnnotationClassSpam:
            return 'btn-danger';
          case Annotation.AnnotationClassEnum.AnnotationClassLikely:
          case Annotation.AnnotationClassEnum.AnnotationClassReliable:
            return 'btn-success';
          default:
            return 'btn-default';
        }
      });
    if (this.unit.annotations) {
      this.annotations = this.unit.annotations.reverse();
    }
    this.annotationVisible = this.openAnnotation && this.highlight === this.unit.unitId
  }

  toggleAnnotations() {
    this.annotationVisible = !this.annotationVisible;
  }

  hideAnnotations() {
    this.annotationVisible = false;
  }

}
