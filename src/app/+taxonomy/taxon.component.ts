import { Component, OnInit, OnDestroy } from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { TaxonomyApi, InformalTaxonGroupApi, InformalTaxonGroup } from '../shared';
import {SharedModule} from "../shared/shared.module";


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
    // TODO remove when https://github.com/ocombe/ng2-translate/issues/232 is fixed
    this.translate.use(SharedModule.currentLang);
    this.subTrans = this.translate.onLangChange
      .subscribe(() => {
        this.refreshInformalGroups();
      });

    this.type = this.route.params.map(params => params['type']);

    this.id = this.route.params.distinctUntilChanged().map(params => params['id']);

    const naks = this.type.filter(type => type == 'informal').switchMap((type) => this.id.distinctUntilChanged());

    naks.filter(id => id == null).forEach(id => {
      this.informalTaxonService.informalTaxonGroupFindRoots(this.translate.currentLang)
        .subscribe(data => {
          this.setSelectedInformalGroup(data);
        });
      this.groups = [];
      this.selectedInformalGroup = null;
    });

    naks.filter(id => id != null).forEach(id => {
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

    naks.filter((id) => id == undefined).subscribe((x) => console.log('not set'));

    naks.filter((id) => id != undefined).subscribe((x) => console.log('set', x));

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
