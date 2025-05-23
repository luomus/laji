import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { tap, filter, switchMap } from 'rxjs/operators';
import { filterNullValues } from '../../trait-db-datasets/trait-db-dataset-editor/trait-db-dataset-editor.component';

type TraitGroup = components['schemas']['TraitGroup'];
type ValidationResponse = components['schemas']['ValidationResponse'];

@Component({
  templateUrl: './trait-db-trait-group-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbTraitGroupEditorComponent {
  form = this.fb.group<Partial<TraitGroup>>({
    id: undefined, // hidden + uneditable
    name: undefined,
    description: undefined,
  });
  submissionState: 'none' | 'externalValidation' | 'uploading' = 'none';
  errors: ValidationResponse['errors'] | undefined;

  constructor(
    private fb: FormBuilder,
    private api: LajiApiClientBService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  onSubmit() {
    this.submissionState = 'externalValidation';
    const form = filterNullValues(this.form.value) as TraitGroup;
    this.form.disable();
    this.api.fetch('/trait/trait-groups/validate', 'post', {}, form, 0).pipe(
      tap(res => {
        this.submissionState = 'none';
        this.errors = res.pass ? undefined : res.errors;
        this.form.enable();
        this.cdr.markForCheck();
      }),
      filter(res => !!res?.pass),
      tap(_ => {
        this.submissionState = 'uploading';
        this.form.disable();
      }),
      switchMap(_ => this.api.fetch('/trait/trait-groups', 'post', {}, form, 0))
    ).subscribe(res => {
      this.submissionState = 'none';
      this.cdr.markForCheck();
      this.router.navigate(['/trait-db/traits'], { relativeTo: this.route });
    }, err => { this.form.enable(); });
  }
}

