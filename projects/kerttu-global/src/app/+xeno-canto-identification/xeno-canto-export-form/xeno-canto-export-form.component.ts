import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, computed,
  effect,
  OnDestroy,
  OnInit,
  output, Signal,
  signal
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IIdentificationHistoryQuery, IIdentificationHistoryResponse, IdentificationHistorySpecies, XenoCantoAnnotationSet } from '../../kerttu-global-shared/models';
import { ColumnChangesService, DimensionsHelper, ScrollbarHelper } from '@achimha/ngx-datatable';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { DatatableSort } from '../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { Subscription } from 'rxjs';

export interface XenoCantoExportFormResult {
  annotationSet: XenoCantoAnnotationSet;
}

type AnnotationSetForm = {
  [K in keyof XenoCantoAnnotationSet]: FormControl<NonNullable<XenoCantoAnnotationSet[K]>>;
};

@Component({
    selector: 'bsg-xeno-canto-export-form',
    templateUrl: './xeno-canto-export-form.component.html',
    styleUrls: ['./xeno-canto-export-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
    providers: [ScrollbarHelper, DimensionsHelper, ColumnChangesService]
})
export class XenoCantoExportFormComponent implements OnInit, OnDestroy {
  siteId?: number;
  exportLoading = signal(false);

  form: FormGroup<AnnotationSetForm>;

  totalAnnotations: Signal<number | undefined>;
  totalBoxCount: Signal<number | undefined>;
  annotationsLoading = signal(false);
  annotationsError = signal(false);

  query = signal<IIdentificationHistoryQuery>({});
  data = signal<PagedResult<IIdentificationHistoryResponse> | undefined>(undefined);

  submitForm = output<XenoCantoExportFormResult>();

  private fetchDataSub?: Subscription;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = new FormGroup<AnnotationSetForm>({
      setName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      setRemarks: new FormControl('', { nonNullable: true })
    });

    this.totalAnnotations = computed(() => this.data()?.total);
    this.totalBoxCount = computed(() => this.getTotalBoxCount(this.data()?.results));

    effect(() => {
      if (this.annotationsLoading() || this.annotationsError() || !this.totalAnnotations()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });

    effect(() => {
      this.fetchData();
    });
  }

  ngOnInit() {
    this.updateQuery();
  }

  ngOnDestroy() {
    this.fetchDataSub?.unsubscribe();
  }

  onPageChange(page: number) {
    this.query.set({ ...this.query(), page });
  }

  onSortChange(sorts: DatatableSort[]) {
    const orderBy = sorts.map(sort => sort.prop + ' ' + sort.dir.toUpperCase());
    this.query.set({ ...this.query(), page: 1, orderBy });
  }

  onSubmit() {
    if (this.form.invalid || !this.totalAnnotations()) {
      return;
    }

    this.submitForm.emit({
      annotationSet: this.form.getRawValue()
    });
  }

  private fetchData() {
    this.fetchDataSub?.unsubscribe();

    this.annotationsError.set(false);
    this.annotationsLoading.set(true);

    this.fetchDataSub = this.kerttuGlobalApi.getIdentificationHistory(this.userService.getToken(), this.query()).subscribe({
      next: (result) => {
        this.data.set(result);
        this.annotationsLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.annotationsError.set(true);
        this.annotationsLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private getTotalBoxCount(results?: IIdentificationHistoryResponse[]): number | undefined {
    if (!results) {
      return undefined;
    }
    return results.reduce((sum, row) => sum + this.getSpeciesBoxCount(row.annotation.species), 0);
  }

  private getSpeciesBoxCount(species: IdentificationHistorySpecies[]): number {
    return species.reduce((sum, s) => sum + (s.boxCount || 0), 0);
  }

  private updateQuery() {
    this.query.set({
      page: 1,
      includeSkipped: false,
      hasBoxes: true,
      exportedToXenoCanto: false,
      site: this.siteId
    });
  }
}
