import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

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

  public groups: Array<InformalTaxonGroup>;

  public selectedInformalGroup: InformalTaxonGroup;

  private subTrans: Subscription;

  private type: Observable<string>;

  private id: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taxonService: TaxonomyApi,
    private translate: TranslateService,
    private informalTaxonService: InformalTaxonGroupApi,
    private location: Location) {}

  ngOnInit() {

    this.subTrans = this.translate.onLangChange
      .subscribe(() => {
        this.refreshInformalGroups();
      });

    this.type = this.route.params.map(params => params['type']);

    this.id = this.route.params.distinctUntilChanged().map(params => params['id']);

    this.id.filter(id => id == null).forEach(id => {
      this.informalTaxonService.informalTaxonGroupFindRoots(this.translate.currentLang)
        .subscribe(data => {
          this.setSelectedInformalGroup(data);
        });
      this.groups = [];
      this.selectedInformalGroup = null;
    });

    this.id.filter(id => id != null).forEach(id => {
      this.informalTaxonService.informalTaxonGroupGetChildren(id, this.translate.currentLang)
        .zip(this.informalTaxonService.informalTaxonGroupFindById(id, this.translate.currentLang))
        .map(data => ({
          id: data[1].id,
          name: data[1].name,
          results: data[0].results
        }))
        .subscribe(data => {
          this.setSelectedInformalGroup(data);
        });
      this.informalTaxonService.informalTaxonGroupGetParents(id, this.translate.currentLang)
        .subscribe(data => {
          this.groups = data;
        }, (error) => {
          this.groups = [];
        });
    });

  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  refreshInformalGroups() {
    this.informalTaxonService.informalTaxonGroupFindRoots(this.translate.currentLang)
      .subscribe(data => {
        this.setSelectedInformalGroup(data);
      });
  }

  setSelectedInformalGroup(data: InformalTaxonGroup) {
    this.selectedInformalGroup = data;
  }
}
