import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { Observable ,  Subscription } from 'rxjs';


@Component({
  selector: 'laji-parents',
  templateUrl: './parents.component.html',
  styleUrls: ['./parents.component.css']
})
export class ParentsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() current: Taxonomy;
  @Input() includeCurrent = true;

  parents$: Observable<Taxonomy[]>;
  langSub: Subscription;

  constructor(private translate: TranslateService, private taxonService: TaxonomyApi) {
  }

  ngOnInit() {
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.initParents();
    });
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['current']) {
      this.initParents();
    }
  }

  ngOnDestroy() {
    this.langSub.unsubscribe();
  }

  initParents() {
    if (!this.current || !this.current.id) {
      return;
    }
    this.parents$ = this
      .taxonService
      .taxonomyFindParents(this.current.id, this.translate.currentLang);
  }

}
