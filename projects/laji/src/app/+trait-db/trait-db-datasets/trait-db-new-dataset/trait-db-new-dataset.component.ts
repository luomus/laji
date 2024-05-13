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

const filterNullValues = <T>(obj: T): T => {
  const clone: any = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== null) {
      clone[key] = val;
    }
  });
  return clone as T;
};

@Component({
  templateUrl: './trait-db-new-dataset.component.html',
  styleUrls: ['./trait-db-new-dataset.component.scss']
})
export class TraitDbNewDatasetComponent implements OnInit, OnDestroy {
  datasetForm = this.fb.group({
    id: [undefined], // hidden + uneditable
    published: [undefined], // only when editing existing dataset
    shareToFinBIF: [undefined], // hidden
    shareToGBIF: [undefined], // hidden
    finbifDOI: [undefined], // uneditable
    gbifDOI: [undefined], // uneditable
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
  errors: ValidationResponse['errors'] | undefined;
  subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private api: LajiApiClientBService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(
      map(paramMap => paramMap.get('id')),
      filter(id => id !== null),
      switchMap(id => this.api.fetch('/trait/datasets/{id}', 'get', { path: { id } }))
    ).subscribe(dataset => {
      Object.entries(dataset).forEach(([key, val]) => {
        this.datasetForm.get(key).setValue(val);
      });
      this.updateShareToGBIF(this.datasetForm.get('shareToFinBIF').value);
      this.cdr.markForCheck();
    });

    this.subscription.add(
      this.datasetForm.get('shareToFinBIF').valueChanges.subscribe(this.updateShareToGBIF.bind(this))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onPublish(event: MouseEvent) {
    event.preventDefault();
    this.datasetForm.get('published').setValue(true);
  }

  onUnpublish(event: MouseEvent) {
    event.preventDefault();
    this.subscription.add(
      this.translate.get('trait-db.new-dataset.publish-confirm').pipe(
        switchMap(str => this.dialogService.confirm(str)),
        filter(res => res)
      ).subscribe(_ => {
        this.datasetForm.get('published').setValue(false);
      })
    );
  }

  onDelete() {
    // TODO add loader
    const form = filterNullValues(this.datasetForm.value) as Dataset;
    this.datasetForm.disable();
    this.api.fetch('/trait/datasets/validate-delete/{id}', 'post', { path: { id: form.id } }).pipe(
      tap(res => {
        // TODO indicate if dataset can't be deleted
        this.datasetForm.enable();
      }),
      filter(res => res.pass),
      tap(_ => { this.datasetForm.disable(); }),
      switchMap(_ => this.api.fetch('/trait/datasets/{id}', 'delete', { path: { id: form.id } }))
    ).subscribe(_ => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

  onSubmit() {
    if (!this.datasetForm.get('id').value) {
      this.submitNewDataset();
    } else {
      this.updateExistingDataset();
    }
  }

  private submitNewDataset() {
    this.externalValidationInProgress = true;
    const form = filterNullValues(this.datasetForm.value) as Dataset;
    this.datasetForm.disable();
    this.api.fetch('/trait/datasets/validate', 'post', { }, form, 0).pipe(
      tap(res => {
        this.externalValidationInProgress = false;
        this.errors = res.pass ? undefined : res.errors;
        this.datasetForm.enable();
        this.cdr.markForCheck();
      }),
      filter(res => res.pass),
      tap(_ => {
        this.uploadInProgress = true;
        this.datasetForm.disable();
      }),
      switchMap(_ => this.api.fetch('/trait/datasets', 'post', { }, form, 0))
    ).subscribe(res => {
      this.uploadInProgress = false;
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
      filter(res => res.pass),
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

  private updateShareToGBIF(shareToFinBIFisActive: boolean) {
    const shareToGBIF = this.datasetForm.get('shareToGBIF');
    shareToFinBIFisActive ? shareToGBIF.enable() : shareToGBIF.disable();
  }
}

