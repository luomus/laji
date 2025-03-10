import { Component, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { filters } from './filters';

interface BaseFilter {
  // what this filter gets mapped to in the final search api query
  // eg. subject.basisOfRecord=<enum-value>
  prop: string;
}

interface StringFilter extends BaseFilter {
  filterType: 'string';
  defaultValue: string | null;
}

interface EnumFilter<T extends string> extends BaseFilter {
  filterType: 'enum';
  range: readonly T[];
  defaultValue: T | null;
}

interface BooleanFilter extends BaseFilter {
  filterType: 'boolean';
  defaultValue: boolean | null;
}

interface NumberFilter extends BaseFilter {
  filterType: 'number';
  defaultValue: number | null;
}

interface ArrayFilterElementString {
  _tag: 'string';
}

interface ArrayFilterElementEnum {
  _tag: 'enum';
  variants: string[];
}

interface ArrayFilter extends BaseFilter {
  filterType: 'array';
  defaultValue: null;
  elementType: ArrayFilterElementString | ArrayFilterElementEnum;
}

export type AdditionalFilter = StringFilter | EnumFilter<any> | BooleanFilter | NumberFilter | ArrayFilter;

// We need an additional FormKey, which is the key in this object,
// because prop can't be used to index formgroup formcontrols.
// The presence of dots in formgroup keys causes mysterious angular errors.
export const additionalFilters = filters as Record<string, AdditionalFilter>;

const propToFormKey: { -readonly [K in keyof typeof additionalFilters as typeof additionalFilters[K]['prop']]: K } = Object
  .entries(additionalFilters)
  .reduce(
    (prev, [k, v]) => { prev[v.prop] = k; return prev; },
    {} as any
  );

export const propIsArray = (prop: string): boolean => {
  const formKey = propToFormKey[prop];
  return additionalFilters[formKey].filterType === 'array';
};

type AdditionalFilterWithFormKey = AdditionalFilter & { formKey: keyof typeof additionalFilters };

const additionalFilterArr: AdditionalFilterWithFormKey[]
  = Object.entries(additionalFilters).map(([k, v]) => ({...v, formKey: <keyof typeof additionalFilters>k}));
const filterDefaultValues: {
  [K in keyof typeof additionalFilters]: typeof additionalFilters[K]['defaultValue']
} = Object.entries(additionalFilters)
  .reduce((p, [k, v]) => { p[k] = v.defaultValue; return p; }, <any>{});

type FilterTypeToValueType<T extends 'string' | 'enum' | 'boolean' | 'number' | 'array'> =
  T extends 'boolean' ? boolean : T extends 'number' ? T extends 'array ' ? any : number : string;

export type AdditionalFilterValues = Partial<{
  -readonly [K in keyof typeof additionalFilters as typeof additionalFilters[K]['prop']]: FilterTypeToValueType<typeof additionalFilters[K]['filterType']> | null
}>;

export const stripDefaultValues = (f: AdditionalFilterValues): Partial<AdditionalFilterValues> => {
  const newFilters: Partial<AdditionalFilterValues> = {};
  Object.entries(f).forEach(([k, v]) => {
    const formKey = propToFormKey[k];
    if (
      v !== undefined
      && v !== filterDefaultValues[formKey]
      && !(Array.isArray(v) && v.length === 0)
    ) {
      newFilters[k as keyof AdditionalFilterValues] = v as any;
    }
  });
  return newFilters;
};

@Component({
  selector: 'laji-trait-search-additional-filters',
  templateUrl: './additional-filters.component.html',
  styleUrls: ['./additional-filters.component.scss']
})
export class TraitSearchAdditionalFiltersComponent implements OnInit {
  @Input() initialValue?: AdditionalFilterValues;
  @Output() filterChange: Observable<AdditionalFilterValues>;

  form: FormGroup<Record<keyof typeof additionalFilters, FormControl>>;
  additionalFilters!: AdditionalFilterWithFormKey[];
  additionalFiltersLookup = additionalFilters;
  unselectedAdditionalFilters = new Set<number>();
  selectedAdditionalFilters = new Set<number>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(filterDefaultValues);
    this.filterChange = this.form.valueChanges.pipe(
      map(values =>
        Object.entries(values)
          .reduce((p, [k, v]) => { p[additionalFilters[k as unknown as keyof typeof additionalFilters].prop] = v; return p; }, {} as AdditionalFilterValues)
      )
    );
    this.additionalFilters = additionalFilterArr;
    this.additionalFilters.forEach((item, idx) => {
      this.unselectedAdditionalFilters.add(idx);
    });
  }

  ngOnInit(): void {
    if (this.initialValue) {
      const propsMappedToFormKeys: any = {};
      Object.entries(this.initialValue).forEach(([k, v]) => {
        propsMappedToFormKeys[propToFormKey[k as keyof typeof propToFormKey]] = v;
        if (v !== undefined && v !== null) {
          const idx = this.additionalFilters.findIndex(f => f.prop === k);
          this.unselectedAdditionalFilters.delete(idx);
          this.selectedAdditionalFilters.add(idx);
        }
      });
      this.form.setValue({ ...filterDefaultValues, ...propsMappedToFormKeys });
    }
  }

  onSelectAdditionalFilter(e: any) {
    const idx = parseInt(e.target.value, 10);
    if (!Number.isNaN(idx)) {
      this.unselectedAdditionalFilters.delete(idx);
      this.selectedAdditionalFilters.add(idx);
    }
  }

  onRemoveAdditionalFilter(idx: number) {
    this.form.get(this.additionalFilters[idx].formKey)?.setValue(null);
    this.selectedAdditionalFilters.delete(idx);
    this.unselectedAdditionalFilters.add(idx);
  }
}
