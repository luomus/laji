import { Component, Input, SimpleChange } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Observable } from "rxjs/Rx";
import { TranslateService } from "ng2-translate/ng2-translate";

import { Taxonomy, TaxonomyApi } from "../../../shared";



@Component({
  selector: 'laji-parents',
  templateUrl: './parents.component.html',
  providers: [ TaxonomyApi ],
  directives: [ ROUTER_DIRECTIVES ]
})
export class ParentsComponent {
  @Input() current:Taxonomy;
  @Input() includeCurrent:boolean = true;

  parents$: Observable<Taxonomy[]>;

  constructor(private translate:TranslateService, private taxonService: TaxonomyApi) {}

  ngOnInit() {
    this.translate.onLangChange.subscribe(
      () => {
        this.parents$ = this
          .taxonService
          .taxonomyFindParents(this.current.id, this.translate.currentLang);
      }
    )
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['current']){
      this.parents$ = this
        .taxonService
        .taxonomyFindParents(this.current.id, this.translate.currentLang);
    }
  }

}
