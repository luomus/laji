import {Component, Input, OnChanges} from '@angular/core';
import {TaxonomyDescription, TaxonomyDescriptionGroup} from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-description',
  templateUrl: './taxon-description.component.html',
  styleUrls: ['./taxon-description.component.scss']
})
export class TaxonDescriptionComponent implements OnChanges {
  @Input() taxonDescriptions: TaxonomyDescription[];
  @Input() groupId: string;
  @Input() title: string;

  taxonDescription: TaxonomyDescription;
  descriptionGroup: TaxonomyDescriptionGroup;

  constructor() { }

  ngOnChanges() {
    this.descriptionGroup = undefined;
    this.taxonDescription = this.taxonDescriptions && this.taxonDescriptions.length > 0 ? this.taxonDescriptions[0] : undefined;

    if (this.taxonDescription) {
      (this.taxonDescription.groups || []).forEach(group => {
        if (group.group === this.groupId) {
          this.descriptionGroup = group;
        }
      });
    }
  }

}
