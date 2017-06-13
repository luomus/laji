import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'laji-children-list',
  templateUrl: './children-list.component.html'
})
export class ChildrenListComponent implements OnInit, OnChanges {
  @Input() parentId: string;

  children$: Observable<Taxonomy[]>;

  constructor(private translate: TranslateService, private taxonService: TaxonomyApi) {
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe(
      () => {
        this.children$ = this
          .taxonService
          .taxonomyFindChildren(this.parentId, this.translate.currentLang);
      }
    );
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['parentId']) {
      this.children$ = this
        .taxonService
        .taxonomyFindChildren(this.parentId, this.translate.currentLang);
    }
  }
}
