import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';
import { IGlobalAnnotationQuery, IGlobalAnnotationResponse } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { DatatableSort } from '../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../../laji/src/app/locale/localize-router.service';

@Component({
  selector: 'bsg-identification-history',
  templateUrl: './identification-history.component.html',
  styleUrls: ['./identification-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationHistoryComponent {
  data$: Observable<PagedResult<IGlobalAnnotationResponse>>;
  loading = false;

  private query: IGlobalAnnotationQuery = { page: 1 };
  private queryChange = new BehaviorSubject<IGlobalAnnotationQuery>(this.query);

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) {
    this.data$ = this.queryChange.pipe(
      tap(() => this.loading = true),
      switchMap(query => this.kerttuGlobalApi.getAnnotations(this.userService.getToken(), query)),
      tap(() => this.loading = false)
    );
  }

  onPageChange(page: number) {
    this.setNewQuery({ ...this.query, page });
  }

  onSortChange(sorts: DatatableSort[]) {
    console.log(sorts);
    // const orderBy = sorts.map(sort => sort.prop + ' ' + sort.dir.toUpperCase());
    // this.changeQuery(this.query, 1, orderBy);
  }

  onRowSelect(row: IGlobalAnnotationResponse) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/identification/recordings']),
      { queryParams: { siteId: row.recording.site.id, recordingId: row.recording.id } }
    );
  }

  private setNewQuery(newQuery: IGlobalAnnotationQuery) {
    this.query = newQuery;
    this.queryChange.next(newQuery);
  }
}
