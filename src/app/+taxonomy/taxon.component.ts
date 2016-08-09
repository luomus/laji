import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs/Subscription';

import { TaxonomyApi, Taxonomy } from '../shared';
import { ParentsComponent } from './parents';
import { ChildrenListComponent } from './children-list';
import { InfoCardComponent } from './info-card';


@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  providers: [ TaxonomyApi ],
  directives: [ ParentsComponent, ChildrenListComponent, InfoCardComponent ]
})
export class TaxonComponent implements OnInit, OnDestroy {

  public taxon:Taxonomy;
  private active:string;
  private subParam:Subscription;
  private subTrans:Subscription;

  constructor(
    private route: ActivatedRoute,
    private taxonService:TaxonomyApi,
    private translate:TranslateService
  ) {}

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.active = params['id'];
      this.getTaxon(this.active);
    });
    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.getTaxon(this.active);
      }
    )
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
    this.subTrans.unsubscribe();
  }

  private getTaxon(id) {
    this.taxonService
      .taxonomyFindBySubject(id, this.translate.currentLang)
      .subscribe(
        taxonomy => this.taxon = taxonomy,
        err => console.log(err)
      );
  }
}
