import { Component, Input, SimpleChange } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Observable } from "rxjs/Rx";

import { TaxonomyApi, Taxonomy } from "../../../shared";


@Component({
  selector: 'laji-children-list',
  templateUrl: './children-list.component.html',
  providers: [ TaxonomyApi ]
})
export class ChildrenListComponent {
  @Input() parentId:string;

  children$: Observable<Taxonomy[]>;

  constructor(private translate:TranslateService, private taxonService: TaxonomyApi) {}

  ngOnInit() {
    this.translate.onLangChange.subscribe(
      () => {
        this.children$ = this
          .taxonService
          .taxonomyFindChildren(this.parentId, this.translate.currentLang);
      }
    )
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['parentId']){
      this.children$ = this
        .taxonService
        .taxonomyFindChildren(this.parentId, this.translate.currentLang);
    }
  }
}
