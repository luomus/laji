import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Observable } from 'rxjs';
import { map, filter, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../../shared/service/user.service';
import { filterNullValues } from '../../trait-db-datasets/trait-db-dataset-editor/trait-db-dataset-editor.component';

type Trait = components['schemas']['Trait'];
type ValidationResponse = components['schemas']['ValidationResponse'];

@Component({
  templateUrl: './trait-db-trait-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbTraitEditorComponent implements OnInit {
  form = this.fb.group<Partial<Trait>>({
    id: undefined, // hidden + uneditable
    group: undefined,
    dataEntryName: undefined,
    name: undefined,
    description: undefined,
    exampleValues: undefined,
    baseUnit: undefined,
    range: undefined,
    enumerations: [],
    reference: undefined,
    identifiers: undefined
  });
  submissionState: 'none' | 'externalValidation' | 'uploading' | 'deleting' = 'none';
  errors: ValidationResponse['errors'] | undefined;

  groups$!: Observable<components['schemas']['TraitGroup'][]>;

  constructor(
    private route: ActivatedRoute,
    private api: LajiApiClientBService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(paramMap => paramMap.get('id')),
      filter(id => id !== null),
      switchMap(id => this.api.fetch('/trait/traits/{id}', 'get', { path: { id: id! } }))
    ).subscribe(trait => {
      Object.entries(trait).forEach(([key, val]) => {
        this.form.get(key)?.setValue(val);
      });
    });

    this.groups$ = this.api.fetch('/trait/trait-groups', 'get', {});
  }

  onSubmit() {
    if (!this.form.get('id')!.value) {
      this.submitNewTrait();
    } else {
      this.updateExistingTrait();
    }
  }

  private submitNewTrait() {
    this.submissionState = 'externalValidation';
    const form = filterNullValues(this.form.value) as Trait;
    this.form.disable();
    this.api.fetch('/trait/traits/validate', 'post', {}, form, 0).pipe(
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
      switchMap(_ => this.api.fetch('/trait/traits', 'post', {}, form, 0))
    ).subscribe(res => {
      this.submissionState = 'none';
      this.cdr.markForCheck();
      this.router.navigate(['../', res.id], { relativeTo: this.route });
    }, err => { this.form.enable(); });
  }

  private updateExistingTrait() {
    this.submissionState = 'externalValidation';
    const form = filterNullValues(this.form.value) as Trait;
    this.form.disable();
    this.api.fetch('/trait/traits/validate-update/{id}', 'post', { path: { id: form.id } }, form).pipe(
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
      switchMap(_ => this.api.fetch('/trait/traits/{id}', 'put', { path: { id: form.id } }, form))
    ).subscribe(res => {
      this.submissionState = 'none';
      this.cdr.markForCheck();
      this.router.navigate(['../'], { relativeTo: this.route });
    }, err => { this.form.enable(); });
  }

  onDelete() {
    this.submissionState = 'deleting';
    const form = filterNullValues(this.form.value) as Trait;
    this.form.disable();
    this.api.fetch('/trait/traits/validate-delete/{id}', 'post', { path: { id: form.id } }).pipe(
      tap(res => {
        this.errors = res.pass ? undefined : res.errors;
        this.form.enable();
        this.cdr.markForCheck();
      }),
      filter(res => !!res?.pass),
      tap(_ => { this.form.disable(); }),
      switchMap(_ => this.api.fetch('/trait/traits/{id}', 'delete', { path: { id: form.id } }))
    ).subscribe(_ => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }, () => {
      this.submissionState = 'none';
      this.form.enable();
      this.cdr.markForCheck();
    });
  }
}

