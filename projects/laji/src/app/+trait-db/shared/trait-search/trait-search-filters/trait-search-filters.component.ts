import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
         Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Observable } from 'rxjs';
import { AdditionalFilterValues } from './additional-filters.component';

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
  searchByTaxon: 'FinBIF' | 'GBIF';
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

  form: FormGroup<Record<keyof Filters, FormControl>>;
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
