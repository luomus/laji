import {Component, OnChanges, Input } from '@angular/core';
import {Taxonomy, TaxonomyDescription, TaxonomyImage} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-overview',
  templateUrl: './taxon-overview.component.html',
  styleUrls: ['./taxon-overview.component.scss']
})
export class TaxonOverviewComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonImages: Array<TaxonomyImage>;

  images = [];
  ingress: any;

  @Input() set taxonDescription(taxonDescription: Array<TaxonomyDescription>) {
    this.ingress = undefined;
    if (taxonDescription && taxonDescription.length > 0 && taxonDescription[0].id === 'default' && taxonDescription[0].groups.length > 0) {
      const desc = taxonDescription[0].groups[0];
      if (desc.variables.length > 0 && desc.variables[0].title && desc.variables[0].title['en'] === 'Ingress') {
        this.ingress = desc.variables[0].content;
      }
    }
  }

  constructor() { }

  ngOnChanges() {
    this.images = [];

    if (this.taxonImages && this.taxonImages.length > 0) {
      this.images = this.taxonImages.slice(0, 9);
    }
  }

  get isFromMasterChecklist() {
    const masterChecklist = 'MR.1';
    if (!this.taxon) {
      return false;
    }
    if (this.taxon.checklist) {
      return this.taxon.checklist.indexOf(masterChecklist) > -1;
    }
    return this.taxon.nameAccordingTo === masterChecklist;
  }

}
