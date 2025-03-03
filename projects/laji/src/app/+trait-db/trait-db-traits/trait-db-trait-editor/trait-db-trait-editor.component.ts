import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Observable } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';

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

    this.form.valueChanges.subscribe(console.log);
  }

  onSubmit() {
  }

  onDelete() {
  }
}

