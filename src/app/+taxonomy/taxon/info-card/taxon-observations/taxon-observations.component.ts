import {Component, Input, OnInit} from '@angular/core';
import {Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-observations',
  templateUrl: './taxon-observations.component.html',
  styleUrls: ['./taxon-observations.component.scss']
})
export class TaxonObservationsComponent implements OnInit {
  @Input() taxon: Taxonomy;

  constructor() { }

  ngOnInit() {
  }

}
