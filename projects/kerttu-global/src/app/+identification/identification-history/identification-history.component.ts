import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';
import { IIdentificationHistoryQuery, IIdentificationHistoryResponse } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { DatatableSort } from '../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../../laji/src/app/locale/localize-router.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IdentificationHistoryEditModalComponent } from './identification-history-edit-modal/identification-history-edit-modal.component';

@Component({
  selector: 'bsg-identification-history',
  templateUrl: './identification-history.component.html',
  styleUrls: ['./identification-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationHistoryComponent {
  data$: Observable<PagedResult<IIdentificationHistoryResponse>>;
  loading = false;

  private query: IIdentificationHistoryQuery = { page: 1 };
  private queryChange = new BehaviorSubject<IIdentificationHistoryQuery>(this.query);

  private modalRef?: BsModalRef;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private modalService: BsModalService
  ) {
    this.data$ = this.queryChange.pipe(
      tap(() => this.loading = true),
      switchMap(query => this.kerttuGlobalApi.getIdentificationHistory(this.userService.getToken(), query)),
      tap(() => this.loading = false)
    );
  }

  onPageChange(page: number) {
    this.setNewQuery({ ...this.query, page });
  }

  onSortChange(sorts: DatatableSort[]) {
    const orderBy = sorts.map(sort => sort.prop + ' ' + sort.dir.toUpperCase());
    this.setNewQuery({ ...this.query, page: 1, orderBy });
  }

  onRowSelect(row: IIdentificationHistoryResponse) {
    const initialState = {
      siteId: row.recording.site.id,
      recordingId: row.recording.id
    };

    this.modalRef = this.modalService.show(
      IdentificationHistoryEditModalComponent,
      { class: 'modal-xl scrollable-modal', initialState }
    );
  }

  private setNewQuery(newQuery: IIdentificationHistoryQuery) {
    this.query = newQuery;
    this.queryChange.next(newQuery);
  }
}
