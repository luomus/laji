import { Component, Input, OnInit } from '@angular/core';
import { Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-occurrence',
  templateUrl: './taxon-occurrence.component.html',
  styleUrls: ['./taxon-occurrence.component.scss']
})
export class TaxonOccurrenceComponent implements OnInit {
  @Input() taxon: Taxonomy;

  constructor() { }

  ngOnInit() {

  }

}
