import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';
import { IIdentificationHistoryQuery, IIdentificationHistoryResponse } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { DatatableSort } from '../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../../laji/src/app/locale/localize-router.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { IdentificationHistoryEditModalComponent } from './identification-history-edit-modal/identification-history-edit-modal.component';

export interface IIdentificationHistoryResponseWithIndex extends IIdentificationHistoryResponse {
  index: number;
}

@Component({
  selector: 'bsg-identification-history',
  templateUrl: './identification-history.component.html',
  styleUrls: ['./identification-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationHistoryComponent {
  query: IIdentificationHistoryQuery = { page: 1 };
  data$: Observable<PagedResult<IIdentificationHistoryResponseWithIndex>>;
  loading = false;

  private results?: IIdentificationHistoryResponseWithIndex[];
  private queryChange = new BehaviorSubject<IIdentificationHistoryQuery>(this.query);
  private modalSub?: Subscription;

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
      map(data => {
        data.results = data.results.map((row, index) => ({ ...row, index }));
        return data as PagedResult<IIdentificationHistoryResponseWithIndex>;
      }),
      tap((data) => this.results = data.results),
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

  onRowSelect(row: IIdentificationHistoryResponseWithIndex) {
    const recordingIdSubject = new BehaviorSubject(row.recording.id);
    const recordingId$ = recordingIdSubject.asObservable();

    const initialState = {
      index: row.index,
      recordingId$,
      lastIndex: this.results.length - 1
    };

    const modalRef = this.modalService.show(
      IdentificationHistoryEditModalComponent,
      { class: 'modal-xl scrollable-modal', initialState, backdrop: true, ignoreBackdropClick: true }
    );

    this.modalSub = new Subscription();
    this.modalSub.add(
      modalRef.content.modalClose.subscribe(hasChanges => {
        if (hasChanges) {
          this.setNewQuery({ ...this.query });
        }
        this.modalSub?.unsubscribe();
      })
    );
    this.modalSub.add(
      modalRef.content.indexChange.subscribe((idx) => {
        recordingIdSubject.next(this.results[idx].recording.id);
      })
    );
  }

  setNewQuery(newQuery: IIdentificationHistoryQuery) {
    this.query = newQuery;
    this.queryChange.next(newQuery);
  }
}