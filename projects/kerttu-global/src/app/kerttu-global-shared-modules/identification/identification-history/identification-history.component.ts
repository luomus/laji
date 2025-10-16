import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PagedResult } from '../../../../../../laji/src/app/shared/model/PagedResult';
import {
  IGlobalSite,
  IIdentificationHistoryQuery,
  IIdentificationHistoryResponse,
  TaxonTypeEnum
} from '../../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { DatatableSort } from '../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { map, switchMap, tap } from 'rxjs/operators';
import { IdentificationHistoryEditModalComponent } from './identification-history-edit-modal/identification-history-edit-modal.component';
import { ModalService } from '../../../../../../laji-ui/src/lib/modal/modal.service';

export interface IIdentificationHistoryResponseWithIndex extends IIdentificationHistoryResponse {
  index: number;
}

@Component({
  selector: 'bsg-identification-history',
  templateUrl: './identification-history.component.html',
  styleUrls: ['./identification-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationHistoryComponent implements OnChanges {
  @Input() sites?: IGlobalSite[];
  @Input() taxonTypes?: TaxonTypeEnum[];

  query: IIdentificationHistoryQuery = { page: 1, includeSkipped: false };
  data$: Observable<PagedResult<IIdentificationHistoryResponseWithIndex>>;
  loading = false;

  private results?: IIdentificationHistoryResponseWithIndex[];
  private queryChange = new BehaviorSubject<IIdentificationHistoryQuery>(this.query);
  private modalSub?: Subscription;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private modalService: ModalService
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonTypes) {
      this.setNewQuery({ ...this.query, taxonTypes: this.taxonTypes });
    }
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
      lastIndex: this.results!.length - 1
    };

    const modalRef = this.modalService.show(
      IdentificationHistoryEditModalComponent,
      { size: 'xl', initialState, noClose: true, contentClass: 'identification-history-edit-modal-content' }
    );

    this.modalSub = new Subscription();
    this.modalSub.add(
      modalRef.content!.modalClose.subscribe(hasChanges => {
        if (hasChanges) {
          this.setNewQuery({ ...this.query });
        }
        this.modalSub?.unsubscribe();
        modalRef.hide();
      })
    );
    this.modalSub.add(
      modalRef.content!.indexChange.subscribe((idx) => {
        recordingIdSubject.next(this.results![idx].recording.id);
      })
    );
  }

  siteChange(value: string) {
    const site = parseInt(value, 10) || undefined;
    this.setNewQuery({ ...this.query, site });
  }

  setNewQuery(newQuery: IIdentificationHistoryQuery) {
    this.query = newQuery;
    this.queryChange.next(newQuery);
  }
}
