import { ChangeDetectionStrategy, Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, NonNullableFormBuilder } from '@angular/forms';
import { components } from 'projects/laji-api-client-b/generated/api';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

type TaxonRank = keyof components['schemas']['HigherTaxa'];
type TaxonSource = 'FinBIF' | 'GBIF';

export const TAXON_RANKS: TaxonRank[] = [
  'domain',
  'kingdom',
  'phylum',
  'subphylum',
  'division',
  'class',
  'subclass',
  'order',
  'suborder',
  'superfamily',
  'family',
  'subfamily',
  'tribe',
  'subtribe',
  'genus'
];

export interface RankFilterValue {
  rank: TaxonRank;
  search: string;
  source: TaxonSource;
}

type RankFilterFormGroup = FormGroup<{
  [K in keyof RankFilterValue]: FormControl<RankFilterValue[K]>;
}>;

@Component({
  selector: 'laji-trait-rank-filter',
  templateUrl: './rank-filter.component.html',
  styleUrls: ['./rank-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TraitRankFilterComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitRankFilterComponent implements ControlValueAccessor, OnInit, OnDestroy {
  form: RankFilterFormGroup = this.fb.group({
    rank: new FormControl<TaxonRank>('domain', { nonNullable: true }),
    search: new FormControl<string>('', { nonNullable: true }),
    source: new FormControl<TaxonSource>('FinBIF', { nonNullable: true }),
  });
  taxonRanks = TAXON_RANKS;
  onChange: (value: RankFilterValue | null) => void = () => {};
  onTouched: () => void = () => {};
  subscription!: Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.subscription = this.form.valueChanges.pipe(
      map(_ => {
        const val = this.form.getRawValue();
        if (!val.search) {
          return null;
        }
        return val;
      }),
    ).subscribe(val => this.onChange(val));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  writeValue(val: RankFilterValue | null): void {
    if (val) {
      this.form.setValue(val);
    } else {
      this.form.setValue({ rank: 'domain', search: '', source: 'FinBIF' });
    }
  }

  registerOnChange(fn: (value: RankFilterValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
