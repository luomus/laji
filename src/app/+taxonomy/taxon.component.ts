import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { InformalTaxonGroupApi } from '../shared/api/InformalTaxonGroupApi';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { InformalTaxonGroup } from '../shared/model/InformalTaxonGroup';
import { Taxonomy } from '../shared/model/Taxonomy';

@Component({
  selector: '[laji-taxonomy]',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.css']
})
export class TaxonComponent implements OnInit, OnDestroy {

  public groups: Array<InformalTaxonGroup>;

  public selectedInformalGroup: InformalTaxonGroup;

  public onlyFinnish: Boolean;

  public vernacularNames: boolean;

  private subTrans: Subscription;

  private subTaxon: Subscription;

  private type: Observable<string>;

  private id: Observable<string>;

  private taxon: Observable<Taxonomy>;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private informalTaxonService: InformalTaxonGroupApi,
    private taxonService: TaxonomyApi
  ) { }

  ngOnInit() {
    this.subTrans = this.translate.onLangChange.subscribe(this.refreshInformalGroups.bind(this));

    this.type = this.route.params.map(params => params['type']);

    this.id = this.route.params.map(params => params['id']);

    this.onlyFinnish = false;

    this.vernacularNames = false;

    const informal = this.type.filter(type => type === 'informal').switchMap((type) => this.id.distinctUntilChanged());

    const taxonomy = this.type.filter(type => type === 'taxonomy').switchMap((type) => this.id);

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
        .subscribe(this.setSelectedInformalGroup.bind(this), () => {});
      this.informalTaxonService.informalTaxonGroupGetParents(id, this.translate.currentLang)
        .subscribe(data => {
          this.groups = data;
        }, (error) => {
          this.groups = [];
        });
    });

    this.taxon = taxonomy.switchMap((id) => this.taxonService.taxonomyFindBySubject(id || 'MX.37600', this.translate.currentLang));
    this.subTaxon = this.taxon.subscribe();
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
    this.subTaxon.unsubscribe();
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
