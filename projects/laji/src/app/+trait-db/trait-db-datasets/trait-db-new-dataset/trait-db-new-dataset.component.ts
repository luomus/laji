import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { tap, filter, switchMap } from 'rxjs/operators';
import { UserService } from '../../../shared/service/user.service';

export type Dataset = components['schemas']['Dataset'];
type ValidationResponse = components['schemas']['ValidationResponse'];

@Component({
  templateUrl: './trait-db-new-dataset.component.html',
  styleUrls: ['./trait-db-new-dataset.component.scss']
})
export class TraitDbNewDatasetComponent {
  datasetForm = this.fb.group({
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

  constructor(
    private fb: FormBuilder,
    private api: LajiApiClientBService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit() {
    this.externalValidationInProgress = true;
    this.api.fetch('/trait/datasets/validate', 'post', { }, <Dataset><unknown>this.datasetForm.value, 0).pipe(
      tap(res => {
        this.externalValidationInProgress = false;
        this.errors = res.pass ? undefined : res.errors;
        this.cdr.markForCheck();
      }),
      filter(res => res.pass),
      tap(_ => {
        this.uploadInProgress = true;
      }),
      switchMap(_ => this.api.fetch('/trait/datasets', 'post', { }, <Dataset><unknown>this.datasetForm.value, 0))
    ).subscribe(res => {
      this.uploadInProgress = false;
      this.cdr.markForCheck();
      this.router.navigate([res.id], { relativeTo: this.route });
    });
  }
}

