import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs/Subscription';

import { TaxonomyApi, Taxonomy } from '../shared';
import { ParentsComponent } from './info-card/parents';
import { ChildrenListComponent } from './info-card/children-list';
import { InfoCardComponent } from './info-card';


@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  providers: [ ],
  directives: [ ParentsComponent, ChildrenListComponent, InfoCardComponent ]
})
export class TaxonComponent {

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

  }

}
