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
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  IIdentificationHistoryQuery, IIdentificationHistoryResponse, IdentificationHistorySpecies, XenoCantoAnnotationSet,
  TaxonomyListEnum, XenoCantoExportData, XenoCantoScope
} from '../../kerttu-global-shared/models';
import { xenoCantoLicenses } from '../../kerttu-global-shared/variables';
import { ColumnChangesService, DimensionsHelper, ScrollbarHelper } from '@achimha/ngx-datatable';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { DatatableSort } from '../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { Subscription } from 'rxjs';


type ScopeFormGroup = FormGroup<{
  taxonCoverage: FormControl<string>;
  completeness: FormControl<string>;
}>;

type ExportForm = {
  [K in keyof Omit<XenoCantoAnnotationSet, 'scope'>]: FormControl<NonNullable<XenoCantoAnnotationSet[K]>>;
} & {
  scope: FormArray<ScopeFormGroup>;
  includeExported: FormControl<boolean>;
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
  defaultAnnotationSetMetadata?: Partial<XenoCantoAnnotationSet>;
  exportLoading = signal(false);

  form: FormGroup<ExportForm>;

  totalAnnotations: Signal<number | undefined>;
  totalBoxCount: Signal<number | undefined>;
  annotationsLoading = signal(false);
  annotationsError = signal(false);

  query = signal<IIdentificationHistoryQuery>({});
  data = signal<PagedResult<IIdentificationHistoryResponse> | undefined>(undefined);

  licenseOptions = xenoCantoLicenses;

  submitForm = output<XenoCantoExportData>();
  cancelForm = output<void>();

  private fetchDataSub?: Subscription;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = new FormGroup<ExportForm>({
      setSource: new FormControl('', { nonNullable: true }),
      setUri: new FormControl('', { nonNullable: true }),
      setName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      setCreator: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      setCreatorId: new FormControl('', { nonNullable: true }),
      setOwner: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      setLicense: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      projectUri: new FormControl('', { nonNullable: true }),
      projectName: new FormControl('', { nonNullable: true }),
      funding: new FormControl('', { nonNullable: true }),
      setRemarks: new FormControl('', { nonNullable: true }),
      scope: new FormArray<ScopeFormGroup>([]),
      includeExported: new FormControl(false, { nonNullable: true })
    });

    this.totalAnnotations = computed(() => this.data()?.total);
    this.totalBoxCount = computed(() => this.getTotalBoxCount(this.data()?.results));

    effect(() => {
      if (this.annotationsLoading() || this.annotationsError()) {
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
    if (this.defaultAnnotationSetMetadata) {
      this.form.patchValue(this.defaultAnnotationSetMetadata);
      if (this.defaultAnnotationSetMetadata.scope) {
        for (const scopeItem of this.defaultAnnotationSetMetadata.scope) {
          this.form.controls.scope.push(this.createScopeGroup(scopeItem));
        }
      }
    }
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

  onIncludeExportedChange() {
    const includeExported = this.form.controls.includeExported.value;
    this.query.set({ ...this.query(), page: 1, exportedToXenoCanto: includeExported ? undefined : false });
  }

  onSubmit() {
    if (this.form.invalid || !this.totalAnnotations()) {
      return;
    }

    const { includeExported, scope, ...rest } = this.form.getRawValue();
    const annotationSet: XenoCantoAnnotationSet = {
      ...rest,
      scope: scope.length > 0 ? scope : undefined
    };
    this.submitForm.emit({
      annotationSet,
      includeExported
    });
  }

  addScope() {
    this.form.controls.scope.push(this.createScopeGroup());
  }

  removeScope(index: number) {
    this.form.controls.scope.removeAt(index);
  }

  private createScopeGroup(value?: XenoCantoScope): ScopeFormGroup {
    return new FormGroup({
      taxonCoverage: new FormControl(value?.taxonCoverage ?? '', { nonNullable: true }),
      completeness: new FormControl(value?.completeness ?? '', { nonNullable: true })
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
      site: this.siteId,
      taxonomyList: TaxonomyListEnum.xenoCanto
    });
  }
}
