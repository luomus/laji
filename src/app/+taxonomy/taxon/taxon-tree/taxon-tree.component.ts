import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'laji-taxon-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent implements OnInit {
  @Input() activeId: string;
  @Input() activeTab: string;

  nodes: any[] = [];

  getChildrenFunc = this.getChildren.bind(this);
  getParentsFunc = this.getParents.bind(this);
  skipParams: {key: string, values: string[], isWhiteList?: boolean}[];

  showMainLevels = false;

  constructor(
    private taxonService: TaxonomyApi,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getRoot();
  }

  getRoot() {
    this.taxonService
      .taxonomyFindBySubject('MX.37600', 'multi', {
        selectedFields: this.getSelectedFields(),
        onlyFinnish: true
      })
      .pipe(
        tap((data) => {
          this.nodes = [data];
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
      });
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

  private getSelectedFields() {
    return ['id', 'taxonRank', 'hasChildren', 'countOfFinnishSpecies', 'vernacularName', 'scientificName', 'cursiveName'].join(',');
  }
}
