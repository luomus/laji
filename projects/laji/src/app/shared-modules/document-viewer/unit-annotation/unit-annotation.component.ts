import { Component, Input, OnInit } from '@angular/core';
import { ToQNamePipe } from '../../../shared/pipe/to-qname.pipe';
import { IdService } from '../../../shared/service/id.service';
import { AnnotationService } from '../service/annotation.service';
import { Annotation } from '../../../shared/model/Annotation';

@Component({
  selector: 'laji-unit-annotation',
  templateUrl: './unit-annotation.component.html',
  styleUrls: ['./unit-annotation.component.scss']
})
export class UnitAnnotationComponent implements OnInit {

  @Input() editors: string[];
  @Input() personID: string;
  @Input() documentID: string;
  @Input() unit: any;
  @Input() highlight: string;
  @Input() identifying: boolean;
  @Input() openAnnotation: boolean;
  @Input() showFacts = false;
  @Input() showAnnotation: boolean;

  annotationVisible = false;
  annotationIcon: string;
  annotations: Annotation[] = [];

  unitID: string;
  skipFacts: string[] = ['UnitGUID', 'InformalNameString'];

  constructor(
    private toQname: ToQNamePipe,
    private annotationService: AnnotationService
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
      annotations.push(annotation);
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

}
