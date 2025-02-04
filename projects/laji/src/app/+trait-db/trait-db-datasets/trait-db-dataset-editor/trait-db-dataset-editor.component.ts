import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Subscription } from 'rxjs';
import { tap, filter, switchMap, map } from 'rxjs/operators';
import { DialogService } from '../../../shared/service/dialog.service';
import { UserService } from '../../../shared/service/user.service';

export type Dataset = components['schemas']['Dataset'];
type ValidationResponse = components['schemas']['ValidationResponse'];

const filterNullValues = <T extends Record<string, unknown>>(obj: T): T => {
  const clone: any = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== null) {
      clone[key] = val;
    }
  });
  return clone as T;
};

@Component({
  templateUrl: './trait-db-dataset-editor.component.html',
  styleUrls: ['./trait-db-dataset-editor.component.scss']
})
export class TraitDbDatasetEditorComponent implements OnInit, OnDestroy {
  datasetForm = this.fb.group({
    id: [undefined as (string | undefined)], // hidden + uneditable
    published: [undefined as (boolean | undefined)], // only when editing existing dataset
    shareToFinBIF: [undefined as (boolean | undefined)], // hidden
    shareToGBIF: [undefined as (boolean | undefined)], // hidden
    finbifDOI: [undefined as (string | undefined)], // uneditable
    gbifDOI: [undefined as (string | undefined)], // uneditable
    name: [''],
    description: [''],
    citation: [''],
    intellectualOwner: [''],
    personResponsible: [''],
    contactEmail: [''],
    institutionCode: [''],
    methods: [''],
    taxonomicCoverage: [''],
    temporalCoverage: [''],
    geographicCoverage: [''],
    coverageBasis: [''],
    additionalIdentifiers: [[]],
  });

  externalValidationInProgress = false;
  uploadInProgress = false;
  deletionInProgress = false;
  errors: ValidationResponse['errors'] | undefined;
  subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private api: LajiApiClientBService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private translate: TranslateService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(
      map(paramMap => paramMap.get('id')),
      filter(id => id !== null),
      switchMap(id => this.api.fetch('/trait/datasets/{id}', 'get', { path: { id: id! } }))
    ).subscribe(dataset => {
      Object.entries(dataset).forEach(([key, val]) => {
        this.datasetForm.get(key)?.setValue(val);
      });
      this.updateShareToGBIF(this.datasetForm.get('shareToFinBIF')!.value);
      this.cdr.markForCheck();
    });

    this.subscription.add(
      this.datasetForm.get('shareToFinBIF')!.valueChanges.subscribe(this.updateShareToGBIF.bind(this))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onPublish(event: MouseEvent) {
    event.preventDefault();
    this.datasetForm.get('published')!.setValue(true);
  }

  onUnpublish(event: MouseEvent) {
    event.preventDefault();
    this.subscription.add(
      this.translate.get('trait-db.new-dataset.publish-confirm').pipe(
        switchMap(str => this.dialogService.confirm(str)),
        filter(res => res)
      ).subscribe(_ => {
        this.datasetForm.get('published')!.setValue(false);
      })
    );
  }

  onDelete() {
    this.deletionInProgress = true;
    const form = filterNullValues(this.datasetForm.value) as Dataset;
    this.datasetForm.disable();
    this.api.fetch('/trait/datasets/validate-delete/{id}', 'post', { path: { id: form.id } }).pipe(
      tap(res => {
        this.errors = res.pass ? undefined : res.errors;
        this.datasetForm.enable();
        this.cdr.markForCheck();
      }),
      filter(res => !!res?.pass),
      tap(_ => { this.datasetForm.disable(); }),
      switchMap(_ => this.api.fetch('/trait/datasets/{id}', 'delete', { path: { id: form.id } }))
    ).subscribe(_ => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }, () => {
      this.deletionInProgress = false;
      this.datasetForm.enable();
      this.cdr.markForCheck();
    });
  }

  onSubmit() {
    if (!this.datasetForm.get('id')!.value) {
      this.submitNewDataset();
    } else {
      this.updateExistingDataset();
    }
  }

  private submitNewDataset() {
    this.externalValidationInProgress = true;
    const form = filterNullValues(this.datasetForm.value) as Dataset;
    this.datasetForm.disable();
    this.api.fetch('/trait/datasets/validate', 'post', { query: { personToken: this.userService.getToken() } }, form, 0).pipe(
      tap(res => {
        this.externalValidationInProgress = false;
        this.errors = res.pass ? undefined : res.errors;
        this.datasetForm.enable();
        this.cdr.markForCheck();
      }),
      filter(res => !!res?.pass),
      tap(_ => {
        this.uploadInProgress = true;
        this.datasetForm.disable();
      }),
      switchMap(_ => this.api.fetch('/trait/datasets', 'post', { query: { personToken: this.userService.getToken() } }, form, 0))
    ).subscribe(res => {
      this.uploadInProgress = false;
      this.api.flush('/trait/dataset-permissions');
      this.cdr.markForCheck();
      this.router.navigate(['../', res.id], { relativeTo: this.route });
    }, err => { this.datasetForm.enable(); });
  }

  private updateExistingDataset() {
    this.externalValidationInProgress = true;
    const form = filterNullValues(this.datasetForm.value) as Dataset;
    this.datasetForm.disable();
    this.api.fetch('/trait/datasets/validate-update/{id}', 'post', { path: { id: form.id } }, form).pipe(
      tap(res => {
        this.externalValidationInProgress = false;
        this.errors = res.pass ? undefined : res.errors;
        this.datasetForm.enable();
        this.cdr.markForCheck();
      }),
      filter(res => !!res?.pass),
      tap(_ => {
        this.uploadInProgress = true;
        this.datasetForm.disable();
      }),
      switchMap(_ => this.api.fetch('/trait/datasets/{id}', 'put', { path: { id: form.id } }, form))
    ).subscribe(res => {
      this.uploadInProgress = false;
      this.cdr.markForCheck();
      this.router.navigate(['../'], { relativeTo: this.route });
    }, err => { this.datasetForm.enable(); });
  }

  private updateShareToGBIF(shareToFinBIFisActive: boolean | null | undefined) {
    const shareToGBIF = this.datasetForm.get('shareToGBIF')!;
    shareToFinBIFisActive ? shareToGBIF.enable() : shareToGBIF.disable();
  }
}
