import { Component, Input, SimpleChange, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';


@Component({
  selector: 'laji-parents',
  templateUrl: './parents.component.html',
  providers: [TaxonomyApi]
})
export class ParentsComponent implements OnInit, OnChanges {
  @Input() current: Taxonomy;
  @Input() includeCurrent: boolean = true;

  parents$: Observable<Taxonomy[]>;

  constructor(private translate: TranslateService, private taxonService: TaxonomyApi) {
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      this.parents$ = this
        .taxonService
        .taxonomyFindParents(this.current.id, this.translate.currentLang);
    });
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['current']) {
      this.parents$ = this
        .taxonService
        .taxonomyFindParents(this.current.id, this.translate.currentLang);
    }
  }

}
