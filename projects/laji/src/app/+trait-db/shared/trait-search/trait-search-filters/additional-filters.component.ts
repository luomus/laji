import { Component, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface BaseFilter {
  // what this filter gets mapped to in the final search api query
  // eg. subject.basisOfRecord=<enum-value>
  prop: string;
}

interface StringFilter extends BaseFilter {
  filterType: 'string';
  defaultValue: 'string' | null;
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

type AdditionalFilter = StringFilter | EnumFilter<any> | BooleanFilter;

// We need an additional FormKey, which is the key in this object,
// because prop can't be used to index formgroup formcontrols.
// The presence of dots in formgroup keys causes mysterious angular errors.
export const additionalFilters = {
  subjectScientificName: { prop: 'subject.scientificName', filterType: 'string', defaultValue: null },
  subjectFinBIFTaxonSensitive: {
    prop: 'subjectFinBIFTaxon.sensitive',
    filterType: 'boolean',
    defaultValue: null
  },
  license: {
    prop: 'license',
    filterType: 'enum',
    defaultValue: null,
    range: [
      'MZ.intellectualRightsCC-BY-SA-4.0', 'MZ.intellectualRightsCC-BY-NC-4.0',
      'MZ.intellectualRightsCC-BY-NC-SA-4.0', 'MZ.intellectualRightsCC-BY-4.0',
      'MZ.intellectualRightsCC0-4.0', 'MZ.intellectualRightsODBL-1.0',
      'MZ.intellectualRightsPD', 'MZ.intellectualRightsARR',
      'MZ.intellectualRightsCC-BY-2.0', 'MZ.intellectualRightsCC-BY-SA-2.0',
      'MZ.intellectualRightsCC-BY-SA-2.0-DE', 'MZ.intellectualRightsCC-BY-NC-2.0',
      'MZ.intellectualRightsCC-BY-NC-SA-2.0', 'MZ.intellectualRightsCC-BY-NC-ND-2.0',
      'MZ.intellectualRightsCC-BY-SA-2.5', 'MZ.intellectualRightsCC-BY-SA-2.5-SE',
      'MZ.intellectualRightsCC-BY-3.0', 'MZ.intellectualRightsCC-BY-SA-3.0',
      'MZ.intellectualRightsCC-BY-NC-SA-3.0', 'MZ.intellectualRightsCC-BY-ND-4.0',
      'MZ.intellectualRightsCC-BY-NC-ND-4.0', 'MY.intellectualRightsCC-BY',
      'MY.intellectualRightsCC0'
    ]
  }
} as const satisfies Record<string, AdditionalFilter>;

const propToFormKey = Object
  .entries(additionalFilters)
  .reduce((prev, [k, v]) => { prev[v.prop] = k; return prev; }, {});

type AdditionalFilterWithFormKey = AdditionalFilter & { formKey: keyof typeof additionalFilters };

const additionalFilterArr: AdditionalFilterWithFormKey[]
  = Object.entries(additionalFilters).map(([k, v]) => ({...v, formKey: <keyof typeof additionalFilters>k}));
const filterDefaultValues: {
  [K in keyof typeof additionalFilters]: typeof additionalFilters[K]['defaultValue']
} = Object.entries(additionalFilters)
  .reduce((p, [k, v]) => { p[k] = v.defaultValue; return p; }, <any>{});

type FilterTypeToValueType<T extends 'string' | 'enum' | 'boolean'> =
  T extends 'boolean' ? boolean : 'string';

export type AdditionalFilterValues = Partial<{
  [K in keyof typeof additionalFilters as typeof additionalFilters[K]['prop']]: FilterTypeToValueType<typeof additionalFilters[K]['filterType'] | null>
}>;

@Component({
  selector: 'laji-trait-search-additional-filters',
  templateUrl: './additional-filters.component.html',
  styleUrls: ['./additional-filters.component.scss']
})
export class TraitSearchAdditionalFiltersComponent implements OnInit {
  @Input() initialValue: AdditionalFilterValues;
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
          .filter(([k, v]) => v !== undefined && v !== null && v !== filterDefaultValues[k])
          .reduce((p, [k, v]) => { p[additionalFilters[k].prop] = v; return p; }, {})
      )
    );
    this.additionalFilters = additionalFilterArr;
    this.additionalFilters.forEach((item, idx) => {
      this.unselectedAdditionalFilters.add(idx);
    });
  }

  ngOnInit(): void {
    if (this.initialValue) {
      const propsMappedToFormKeys = {};
      Object.entries(this.initialValue).forEach(([k, v]) => {
        propsMappedToFormKeys[propToFormKey[k]] = v;
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
    this.form.get(this.additionalFilters[idx].formKey).setValue(null);
    this.selectedAdditionalFilters.delete(idx);
    this.unselectedAdditionalFilters.add(idx);
  }
}
