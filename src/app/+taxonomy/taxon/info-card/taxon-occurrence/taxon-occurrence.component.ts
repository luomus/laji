import { Component, Input, OnInit } from '@angular/core';
import {Taxonomy, TaxonomyDescription, TaxonomyDescriptionGroup} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-occurrence',
  templateUrl: './taxon-occurrence.component.html',
  styleUrls: ['./taxon-occurrence.component.scss']
})
export class TaxonOccurrenceComponent implements OnInit {
  @Input() taxon: Taxonomy;

  occurrenceDescriptions: TaxonomyDescriptionGroup;
  _taxonDescription: TaxonomyDescription;

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.occurrenceDescriptions = undefined;
    this._taxonDescription = taxonDescription && taxonDescription.length > 0 ? taxonDescription[0] : undefined;

    if (this._taxonDescription) {
      (this._taxonDescription.groups || []).forEach(group => {
        console.log(group);
        /*if (group.group === 'MX.SDVG14') {
          this.occurrenceDescriptions = group;
        }*/
      });
    }
  }

  constructor() { }

  ngOnInit() {

  }

}
