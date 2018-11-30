import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TreeTableComponent } from './tree-table/tree-table.component';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { TreeNode } from './tree-table/model/tree-node.interface';
import { Taxonomy } from '../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent implements OnInit {
  @Input() activeId: string;

  public nodes: any[] = [];
  public columns: ObservationTableColumn[] = [{
    name: 'scientificName',
    label: 'taxonomy.scientific.name',
    cellTemplate: 'taxonScientificName',
    width: 200
  }];
  public getChildrenFunc = this.getChildren.bind(this);
  public getParentsFunc = this.getParents.bind(this);
  public skipParams: {key: string, values: string[], isWhiteList?: boolean}[];
  public hideParams: {key: string, values: string[], isWhiteList?: boolean}[] = [{key: 'id', values: []}];

  public showMainLevels = false;

  @ViewChild('treeTable') private tree: TreeTableComponent;

  constructor(
    private taxonService: TaxonomyApi,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getRoot();
  }

  getRoot(): Subscription {
    if (this.nodes && this.nodes.length > 0) {
      this.nodes = [{...this.nodes[0], children: undefined}];
      return;
    }

    this.taxonService
      .taxonomyFindBySubject('MX.37600', 'multi', {
        selectedFields: this.getSelectedFields(),
        onlyFinnish: true
      })
      .pipe(
        map(data => this.mapSpeciesCountsToLeafCounts([data])),
        tap((data) => {
          this.nodes = data;
        })
      )
      .subscribe(() => {
        this.cd.markForCheck();
      });
  }

  getChildren(id: string) {
    return this.taxonService
      .taxonomyFindChildren(id, 'multi', undefined, {
        selectedFields: this.getSelectedFields(),
        onlyFinnish: true
      })
      .pipe(
        map(data => this.mapSpeciesCountsToLeafCounts(data))
      )
  }

  getParents(id: string) {
    return this.taxonService
      .taxonomyFindParents(id, 'multi', {
        selectedFields: 'id',
        onlyFinnish: true
      });
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

  hideUnopenedNodes() {
    this.hideUnopened(this.tree.getVisibleNodes());
    this.hideParams = [...this.hideParams];
  }

  showAllNodes() {
    this.hideParams = [{key: 'id', values: []}];
  }

  private hideUnopened(nodes: TreeNode[]) {
    const someOpen = nodes.some((node) => !!node.children);
    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].children) {
        if (someOpen && this.hideParams[0].values.indexOf(nodes[i].id) === -1) {
          this.hideParams[0].values.push(nodes[i].id);
        }
      } else {
        this.hideUnopened(nodes[i].children);
      }
    }
  }

  private mapSpeciesCountsToLeafCounts(taxons: Taxonomy[]) {
    return taxons.map(taxon => ({
      ...taxon,
      leafCount: taxon.countOfFinnishSpecies,
      countOfSpecies: undefined,
      countOfFinnishSpecies: undefined
    }));
  }

  private getSelectedFields() {
    return ['id', 'taxonRank', 'hasChildren', 'countOfFinnishSpecies', 'scientificName', 'cursiveName'].join(',');
  }

  onTaxonSelect(key: string) {
    this.activeId = key;
    this.tree.openTreeById(key);
  }
}
