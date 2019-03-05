import {ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';
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
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getRoot();
  }

  getRoot() {
    this.taxonService
      .taxonomyFindBySubject('MX.37600', this.translate.currentLang, {
        selectedFields: this.getSelectedFields(),
        onlyFinnish: false
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
      .taxonomyFindChildren(id, this.translate.currentLang, undefined, {
        selectedFields: this.getSelectedFields(),
        onlyFinnish: false
      });
  }

  getParents(id: string) {
    return this.taxonService
      .taxonomyFindParents(id, this.translate.currentLang, {
        selectedFields: 'id',
        onlyFinnish: false
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
    return ['id', 'hasChildren', 'vernacularName', 'scientificName', 'cursiveName'].join(',');
  }
}
