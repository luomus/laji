import { Component, Input } from '@angular/core';
import { TaxonTaxonomyService } from '../service/taxon-taxonomy.service';
import { TreeSkipParameter } from './tree/model/tree.interface';

@Component({
  selector: 'laji-taxon-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent {
  @Input() activeId: string;
  @Input() activeTab: string;

  getDataFunc = this.getData.bind(this);
  getChildrenFunc = this.getChildren.bind(this);
  getParentsFunc = this.getParents.bind(this);
  skipParams: TreeSkipParameter[];

  showMainLevels = false;

  constructor(
    private taxonomyService: TaxonTaxonomyService
  ) {}

  getData(id: string) {
    return this.taxonomyService.getTaxon(id);
  }

  getChildren(id: string) {
    return this.taxonomyService.getChildren(id);
  }

  getParents(id: string) {
    return this.taxonomyService.getParents(id);
  }

  setSkipParams() {
    if (this.showMainLevels) {
      this.skipParams = [{key: 'taxonRank', isWhiteList: true, values: [
        'MX.superdomain',
        'MX.domain',
        'MX.kingdom',
        'MX.phylum',
        'MX.class',
        'MX.order',
        'MX.family',
        'MX.genus',
        'MX.species'
      ]}];
    } else {
      this.skipParams = undefined;
    }
  }
}
