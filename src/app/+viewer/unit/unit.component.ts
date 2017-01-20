import { Component, OnInit, Input } from '@angular/core';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';

@Component({
  selector: 'laji-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent implements OnInit {

  @Input() unit: any;
  @Input() highlight: string;

  skipFacts: string[] = ['UnitGUID', 'InformalNameString'];

  constructor(private toQname: ToQNamePipe) { }

  ngOnInit() {
    if (this.unit && this.unit.linkings) {
      this.unit.linkings.taxonId = this.toQname.transform(this.unit.linkings.taxon.qname);
    }
    if (this.unit && this.unit.facts) {
      this.unit.facts = this.unit.facts.filter(item => this.skipFacts.indexOf(item.fact) === -1);
    }
  }

}
