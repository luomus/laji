import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { TaxonomyApi, InformalTaxonGroupApi, InformalTaxonGroup, Taxonomy } from '../shared';
import { SharedModule } from '../shared/shared.module';

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

  private subTaxon: Subscription;

  private subParents: Subscription;

  private type: Observable<string>;

  private id: Observable<string>;

  private selected: Array<Taxonomy>;

  private taxon: Observable<Taxonomy>;

  private parents: Observable<Array<Taxonomy>>;

  private taxonSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private informalTaxonService: InformalTaxonGroupApi,
    private taxonService: TaxonomyApi
  ) { }

  ngOnInit() {
    this.subTrans = this.translate.onLangChange.subscribe(this.refreshInformalGroups.bind(this));

    this.type = this.route.params.map(params => params['type']);

    this.id = this.route.params.distinctUntilChanged().map(params => params['id']);

    const informal = this.type.filter(type => type === 'informal').switchMap((type) => this.id.distinctUntilChanged());

    const taxonomy = this.type.filter(type => type === 'taxonomy').switchMap((type) => this.id.distinctUntilChanged());

    informal.filter(id => id == null).forEach(id => {
      this.informalTaxonService
        .informalTaxonGroupFindRoots(this.translate.currentLang)
        .subscribe(this.setSelectedInformalGroup.bind(this));
      this.groups = [];
      this.selectedInformalGroup = null;
    });

    informal.filter(id => id != null).forEach(id => {
      this.informalTaxonService.informalTaxonGroupGetChildren(id, this.translate.currentLang)
        .zip(this.informalTaxonService.informalTaxonGroupFindById(id, this.translate.currentLang))
        .map(this.parseInformalTaxonGroup.bind(this))
        .subscribe(this.setSelectedInformalGroup.bind(this));
      this.informalTaxonService.informalTaxonGroupGetParents(id, this.translate.currentLang)
        .subscribe(data => {
          this.groups = data;
        }, (error) => {
          this.groups = [];
        });
    });

    this.taxon = taxonomy.switchMap((id) => this.taxonService.taxonomyFindBySubject(id, this.translate.currentLang));
    this.parents = taxonomy.switchMap((id) => this.taxonService.taxonomyFindParents(id, this.translate.currentLang));
    this.subTaxon = this.taxon.subscribe();
    this.subParents = this.parents.subscribe();
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
    this.subTaxon.unsubscribe();
    this.subParents.unsubscribe();
  }

  parseInformalTaxonGroup(data) {
    const { results } = data[0];
    const { id, name } = data[1];
    return { results, id, name };
  };

  refreshInformalGroups() {
    this.informalTaxonService
      .informalTaxonGroupFindRoots(this.translate.currentLang)
      .subscribe(this.setSelectedInformalGroup.bind(this));
  }

  setSelectedInformalGroup(data: InformalTaxonGroup) {
    this.selectedInformalGroup = data;
  }
}
