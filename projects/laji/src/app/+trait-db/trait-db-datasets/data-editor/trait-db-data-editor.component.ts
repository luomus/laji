import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { UserService } from '../../../shared/service/user.service';
import { map, filter, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { components } from 'projects/laji-api-client-b/generated/api';
import { cols } from './data-editor-search-table-columns';
import { FooterService } from '../../../shared/service/footer.service';

@Component({
  templateUrl: './trait-db-data-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEditorComponent implements OnInit, OnDestroy {
  columns = cols.map(([prop, _]) => ({ title: prop as string, prop: prop as string, sortable: false }));
  rows$!: Observable<components['schemas']['InputRow'][]>;
  private datasetId$: Observable<string>;

  constructor(
    private api: LajiApiClientBService,
    private userService: UserService,
    private route: ActivatedRoute,
    private footerService: FooterService
  ) {
    this.datasetId$ = this.route.params.pipe(map(params => params['id']), filter(v => v !== undefined));
  }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.rows$ = combineLatest(
      this.datasetId$,
      this.userService.isLoggedIn$.pipe(filter(state => !!state))
    ).pipe(
      switchMap(([datasetId, _]) => this.api.fetch('/trait/rows/search', 'get', {
        query: { datasetId, pageSize: 1000, personToken: this.userService.getToken() } })
      )
    );
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }
}

