import {Component, Input, OnInit} from '@angular/core';
import {Taxonomy, TaxonomyDescription, TaxonomyDescriptionGroup} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-invasive',
  templateUrl: './taxon-invasive.component.html',
  styleUrls: ['./taxon-invasive.component.scss']
})
export class TaxonInvasiveComponent implements OnInit {
  @Input() taxon: Taxonomy;

  invasiveDescriptions: TaxonomyDescriptionGroup;
  _taxonDescription: TaxonomyDescription;

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.invasiveDescriptions = undefined;
    this._taxonDescription = taxonDescription && taxonDescription.length > 0 ? taxonDescription[0] : undefined;

    if (this._taxonDescription) {
      (this._taxonDescription.groups || []).forEach(group => {
        if (group.group === 'MX.SDVG13') {
          this.invasiveDescriptions = group;
        }
      });
    }
  }

  constructor() { }

  ngOnInit() { }

}
