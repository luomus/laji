import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'laji-parents',
  templateUrl: './parents.component.html'
})
export class ParentsComponent implements OnInit, OnChanges {
  @Input() current: Taxonomy;
  @Input() includeCurrent = true;

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
