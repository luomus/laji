import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { Observable } from 'rxjs/Observable';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';


@Component({
  selector: 'laji-children-list',
  templateUrl: './children-list.component.html'
})
export class ChildrenListComponent implements OnInit, OnChanges {
  @Input() parentId: string;

  children$: Observable<Taxonomy[]>;

  columns: ObservationTableColumn[] = [
    {
      name: 'vernacularName',
      label: 'taxonomy.vernacular.name',
      sortable: true
    },
    {
      name: 'scientificName',
      label: 'taxonomy.scientific.name',
      cellTemplate: 'taxonScientificName',
      sortable: true
    }
  ];

  constructor(
    private translate: TranslateService,
    private taxonService: TaxonomyApi,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) {
  }

  onRowSelect(event) {
    if (event.row && event.row.id) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', event.row.id]));
    }
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
        .taxonomyFindChildren(this.parentId, this.translate.currentLang, undefined, {
          selectedFields: 'vernacularName,scientificName,cursiveName,id'
        });
    }
  }
}
