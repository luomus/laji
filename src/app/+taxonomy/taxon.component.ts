import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';

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
export class TaxonComponent {

  private active:string;
  public taxon:Taxonomy;

  constructor(
    private route: ActivatedRoute,
    private taxonService:TaxonomyApi,
    private translate:TranslateService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.active = params['id'];
      this.getTaxon(this.active);
    });
    this.translate.onLangChange.subscribe(
      () => {
        this.getTaxon(this.active);
      }
    )
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
