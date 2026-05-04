import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  IIdentificationHistoryQuery,
  IIdentificationHistoryResponse,
  IdentificationHistorySpecies
} from '../../kerttu-global-shared/models';
import { DatatableColumn, DatatableSort } from '../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';

@Component({
    selector: 'bsg-annotation-box-table',
    templateUrl: './annotation-box-table.component.html',
    styleUrls: ['./annotation-box-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AnnotationBoxTableComponent implements OnInit, OnChanges {
  @ViewChild('xenoCantoIdTpl', { static: true }) private xenoCantoIdTemplate!: TemplateRef<any>;
  @ViewChild('speciesListTpl', { static: true }) private speciesListTemplate!: TemplateRef<any>;
  @ViewChild('boxCountTpl', { static: true }) private boxCountTemplate!: TemplateRef<any>;

  @Input({ required: true }) query!: IIdentificationHistoryQuery;

  @Output() totalChange = new EventEmitter<number>();
  @Output() totalBoxCountChange = new EventEmitter<number>();

  columns: DatatableColumn[] = [];
  data?: PagedResult<IIdentificationHistoryResponse>;
  loading = false;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.columns = [
      {
        name: 'annotation.created',
        label: 'history.created',
        cellTemplate: 'date',
        width: 90
      },
      {
        name: 'annotation.edited',
        label: 'history.edited',
        cellTemplate: 'date',
        width: 90
      },
      {
        name: 'recording.xenoCantoId',
        label: 'xenoCantoExport.xenoCantoId',
        cellTemplate: this.xenoCantoIdTemplate,
        width: 70
      },
      {
        name: 'annotation.species',
        label: 'history.species',
        cellTemplate: this.speciesListTemplate,
        width: 300,
        sortable: false
      },
      {
        name: 'annotation.species',
        label: 'xenoCantoExport.boxCount',
        cellTemplate: this.boxCountTemplate,
        width: 70,
        sortable: false
      }
    ];
    this.fetchData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.query && !changes.query.isFirstChange()) {
      this.fetchData();
    }
  }

  onPageChange(page: number) {
    this.query = { ...this.query, page };
    this.fetchData();
  }

  onSortChange(sorts: DatatableSort[]) {
    const orderBy = sorts.map(sort => sort.prop + ' ' + sort.dir.toUpperCase());
    this.query = { ...this.query, page: 1, orderBy };
    this.fetchData();
  }

  private fetchData() {
    this.loading = true;
    this.kerttuGlobalApi.getIdentificationHistory(this.userService.getToken(), this.query).subscribe({
      next: (result) => {
        this.data = result;
        this.totalChange.emit(result.total);
        this.totalBoxCountChange.emit(this.getTotalBoxCount(result.results));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private getSpeciesBoxCount(species: IdentificationHistorySpecies[]): number {
    return species.reduce((sum, s) => sum + (s.boxCount || 0), 0);
  }

  private getTotalBoxCount(results: IIdentificationHistoryResponse[]): number {
    return results.reduce((sum, row) => sum + this.getSpeciesBoxCount(row.annotation.species), 0);
  }
}
