import { Component, Input, OnChanges } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type TaxonDescription = components['schemas']['Content'][number];
type TaxonDescriptionGroup = TaxonDescription['groups'][number];

@Component({
  selector: 'laji-taxon-description',
  templateUrl: './taxon-description.component.html',
  styleUrls: ['./taxon-description.component.scss']
})
export class TaxonDescriptionComponent implements OnChanges {
  @Input() taxonDescriptions?: TaxonDescription[];
  @Input() groupId!: string;
  @Input() title?: string;

  taxonDescription?: TaxonDescription;
  descriptionGroup?: TaxonDescriptionGroup;

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
