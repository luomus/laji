import { Component, Input, OnInit } from '@angular/core';
import { Occurrence } from '../../../../../../laji/src/app/shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-occurrences',
  templateUrl: './taxon-occurrences.component.html',
  styleUrls: ['./taxon-occurrences.component.scss']
})
export class TaxonOccurrencesComponent implements OnInit {
  @Input() occurrences: Occurrence[];

  constructor() { }

  ngOnInit() {
  }

}
