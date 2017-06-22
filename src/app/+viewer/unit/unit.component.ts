import { Component, Input, OnInit } from '@angular/core';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { IdService } from '../../shared/service/id.service';
import { AnnotationService } from '../service/annotation.service';

@Component({
  selector: 'laji-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent implements OnInit {

  @Input() editors: string[];
  @Input() personID: string;
  @Input() documentID: string;
  @Input() unit: any;
  @Input() highlight: string;
  @Input() showFacts = false;
  annotationVisible = false;

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
      if (this.unit.facts) {
        this.unit.facts = this.unit.facts.filter(item => this.skipFacts.indexOf(item.fact) === -1);
      }
      if (this.unit.unitId) {
        this.unitID = IdService.getId(this.unit.unitId);
      }
      this.annotationService.getAllFromRoot(this.documentID)
        .subscribe();
    }
  }

  toggleAnnotations() {
    this.annotationVisible = !this.annotationVisible;
  }

  hideAnnotations() {
    this.annotationVisible = false;
  }

}
