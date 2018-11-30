import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { DatatableComponent } from '../../../shared-modules/datatable/datatable/datatable.component';
import { Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const query = {
  selectedFields: 'vernacularName,scientificName,cursiveName,id'
};

@Component({
  selector: 'laji-children-list',
  templateUrl: './children-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildrenListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() parentId: string;
  @ViewChild('dataTable') public datatable: DatatableComponent;

  children: Taxonomy[];
  size = 0;

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

  private subFetch: Subscription;

  constructor(
    private translate: TranslateService,
    private taxonService: TaxonomyApi,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef
  ) {
  }

  onRowSelect(event) {
    if (event.row && event.row.id) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', event.row.id]));
    }
  }

  ngOnInit() {
    this.subFetch = this.taxonService
      .taxonomyFindChildren(this.parentId, this.translate.currentLang, undefined, query)
      .subscribe((data) => {
        this.children = data;
        this.size = data.length;
        this.cd.markForCheck();
      });
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['parentId'] && !changes['parentId'].isFirstChange()) {
      if (this.subFetch) {
        this.subFetch.unsubscribe();
      }
      this.subFetch = this.taxonService
        .taxonomyFindChildren(this.parentId, this.translate.currentLang, undefined, query)
        .subscribe((data) => {
          this.children = data;
          this.size = data.length;
          this.cd.markForCheck();
        });
    }
  }

  ngOnDestroy() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
  }
}
