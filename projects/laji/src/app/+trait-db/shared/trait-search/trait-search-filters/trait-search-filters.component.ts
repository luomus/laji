import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
         Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Observable } from 'rxjs';
import { AdditionalFilterValues, stripDefaultValues as stripAdditionalFilterDefaultValues } from './additional-filters.component';

export const HIGHER_TAXA: (keyof components['schemas']['HigherTaxa'])[] = [
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

export type Filters = {
  dataset: string | null;
  trait: string | null;
  searchByTaxon: 'FinBIF' | 'GBIF' | null;
  additionalFilters: AdditionalFilterValues | null;
} & {
  [K in typeof HIGHER_TAXA[number]]: string | null;
};

export const filterDefaultValues: Filters = {
  dataset: null,
  trait: null,
  searchByTaxon: 'FinBIF',
  additionalFilters: null,
  domain: null,
  kingdom: null,
  phylum: null,
  subphylum: null,
  division: null,
  class: null,
  subclass: null,
  order: null,
  suborder: null,
  superfamily: null,
  family: null,
  subfamily: null,
  tribe: null,
  subtribe: null,
  genus: null
};

export const stripDefaultValues = (filters: Partial<Filters>): Partial<Filters> => {
  const newFilters: Partial<Filters> = {};
  Object.entries(filters).forEach(([k, v]) => {
    if (k === 'additionalFilters') {
      newFilters['additionalFilters'] = stripAdditionalFilterDefaultValues(v as any) as any;
    } else {
      if (v !== undefined && v !== filterDefaultValues[k as keyof Filters]) {
        newFilters[k as keyof Filters] = v as any;
      }
    }
  });
  return newFilters;
};

@Component({
  selector: 'laji-trait-search-filters',
  templateUrl: './trait-search-filters.component.html',
  styleUrls: ['./trait-search-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitSearchFiltersComponent implements OnInit {
  @Input() initialValue: Partial<Filters> | undefined;
  @Output() filterChange: Observable<Partial<Filters>>;
  @Output() searchClicked = new EventEmitter<void>();

  form: FormGroup<{[K in keyof Filters]: FormControl<Filters[K]>}>;
  datasets$: Observable<components['schemas']['Dataset'][]>;
  traits$: Observable<components['schemas']['Trait'][]>;

  higherTaxa = HIGHER_TAXA;

  constructor(
    private fb: FormBuilder,
    private api: LajiApiClientBService
  ) {
    this.form = this.fb.group(filterDefaultValues);
    this.filterChange = this.form.valueChanges;
    this.datasets$ = this.api.fetch('/trait/datasets', 'get', {});
    this.traits$ = this.api.fetch('/trait/traits', 'get', {});
  }

  ngOnInit() {
    if (this.initialValue !== undefined) {
      Object.entries(this.initialValue).forEach(([k, v]) => {
        if (v !== null) {
          this.form.get(k)?.setValue(v);
        }
      });
    }
  }

  onSearch() {
    this.searchClicked.emit();
  }

  onClear() {
    this.form.setValue(filterDefaultValues);
  }

  onAdditionalFiltersChange(filterValues: AdditionalFilterValues) {
    this.form.get('additionalFilters')!.setValue(filterValues);
  }
}
