import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TaxonTaxonomyService } from '../service/taxon-taxonomy.service';
import { TreeSkipParameter } from './tree/model/tree.interface';

@Component({
  selector: 'laji-taxon-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonTreeComponent {
  @Input() activeId: string;
  @Input() activeTab: string;
  @Output() routeUpdate = new EventEmitter();

  getDataFunc = this.getData.bind(this);
  getChildrenFunc = this.getChildren.bind(this);
  getParentsFunc = this.getParents.bind(this);
  skipParams: TreeSkipParameter[] = [{key: 'hiddenTaxon', isWhiteList: true, values: [false]}];

  showMainLevels = false;
  showHidden = false;

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
    const tempSkipParams = [];

    if (this.showMainLevels) {
      tempSkipParams.push({key: 'taxonRank', isWhiteList: true, values: [
        'MX.superdomain',
        'MX.domain',
        'MX.kingdom',
        'MX.phylum',
        'MX.class',
        'MX.order',
        'MX.family',
        'MX.genus',
        'MX.species'
      ]});
    }

    if (!this.showHidden) {
      tempSkipParams.push({key: 'hiddenTaxon', isWhiteList: true, values: [false]});
    }

    tempSkipParams.length === 0 ? this.skipParams = undefined : this.skipParams = tempSkipParams;

    this.routeUpdate.emit({ showHidden: this.showHidden });
  }
}
