import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs/Subscription';

import { TaxonomyApi, Taxonomy, InformalTaxonGroupApi, InformalTaxonGroup } from '../shared';
import { InformalListBreadcrumbComponent } from "./informal-list-breadcrumb/informal-list-breadcrumb.component";
import { InformalListComponent } from "./informal-list/informal-list.component";
import { SpeciesListComponent } from "./species-list/species-list.component";
import { InformalListItemInterface } from "./informal-list/informal-list-item.model";
import { TreeOfLifeComponent } from "./tree-of-life/tree-of-life.component";


@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  providers: [InformalTaxonGroupApi, TaxonomyApi],
  styleUrls: ['taxon.component.css']
})
export class TaxonComponent implements OnInit, OnDestroy {

  public tree: InformalTaxonGroup[];

  public groups: Array<InformalTaxonGroup> = [];

  public selectedInformalGroup: InformalTaxonGroup;

  private subTrans: Subscription;

  constructor(
    private route: ActivatedRoute,
    private taxonService: TaxonomyApi,
    private translate: TranslateService,
    private informalTaxonService: InformalTaxonGroupApi
  ) { }

  onGroupSelect(group: InformalListItemInterface) {
    this.groups.push(group);
    this.selectedInformalGroup = group;
  }

  onBreadcrumSelect(group: InformalListItemInterface) {
    if (group != null) {
      let curr = this.groups.pop();
      while (group.id != curr.id) {
        curr = this.groups.pop();
      }
      this.groups.push(curr);
    } else {
      this.groups = [];
    }
    this.selectedInformalGroup = group;
  }

  ngOnInit() {
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.refreshInformalGroups()
    );
    this.refreshInformalGroups();
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  refreshInformalGroups() {
    this.informalTaxonService.informalTaxonGroupGetTree(this.translate.currentLang)
      .subscribe(
      data => this.tree = data.results
      )
  }
}
