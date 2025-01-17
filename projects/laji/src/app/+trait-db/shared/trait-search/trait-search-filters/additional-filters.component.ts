import { Component, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

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

type AdditionalFilter<T extends string> = StringFilter | EnumFilter<T> | BooleanFilter;

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
} as const satisfies Record<string, AdditionalFilter<any>>;

type AdditionalFilterWithFormKey = AdditionalFilter<any> & { formKey: keyof typeof additionalFilters };

const additionalFilterArr: AdditionalFilterWithFormKey[]
  = Object.entries(additionalFilters).map(([k, v]) => ({...v, formKey: <keyof typeof additionalFilters>k}));
const filterDefaultValues: {
  [K in keyof typeof additionalFilters]: typeof additionalFilters[K]['defaultValue']
} = Object.entries(additionalFilters)
  .reduce((p, [k, v]) => { p[k] = v.defaultValue; return p; }, <any>{});

type FilterTypeToValueType<T extends 'string' | 'enum' | 'boolean'> =
  T extends 'boolean' ? boolean : 'string';

export type FormChangeType = Partial<{
  [K in keyof typeof additionalFilters]: FilterTypeToValueType<(typeof additionalFilters)[K]['filterType']>
}>;

@Component({
  selector: 'laji-trait-search-additional-filters',
  template: `
<details class="lu-details" open>
  <summary>Additional filters</summary>
  <div class="mb-4">
    <label for="trait-search-filters-additional-filter">Add a filter:</label>
    <select class="form-control" id="trait-search-filters-additional-filter" (change)="onSelectAdditionalFilter($event)">
      <option [value]="null">None</option>
      <option *ngFor="let filterIdx of unselectedAdditionalFilters" [value]="filterIdx">{{ additionalFilters[filterIdx].prop }}</option>
    </select>
  </div>
  <div *ngFor="let filterIdx of selectedAdditionalFilters">
    <ng-container *ngTemplateOutlet="
      { string: stringFilter, enum: enumFilter, boolean: booleanFilter }[additionalFilters[filterIdx].filterType];
      context: { $implicit: additionalFilters[filterIdx].prop, formKey: additionalFilters[filterIdx].formKey }
      "></ng-container>
    <button class="btn btn-default" (click)="onRemoveAdditionalFilter(filterIdx)">Remove</button>
  </div>
</details>
<ng-template #stringFilter let-prop let-formKey='formKey'>
  <div class="mb-4">
    <label [for]="'trait-search-filters-' + formKey">{{ prop }}</label>
    <input [formControl]="form.get(formKey)" class="form-control" type="text" [id]="'trait-search-filters-' + formKey">
  </div>
</ng-template>
<ng-template #enumFilter let-prop let-formKey='formKey'>
  <div class="mb-4">
    <label [for]="'trait-search-filters-' + formKey">{{ prop }}</label>
    <select class="form-control" [formControl]="form.get(formKey)" class="form-control" [id]="'trait-search-filters-' + formKey">
      <option [value]="null">None</option>
      <option *ngFor="let val of additionalFiltersLookup[formKey].range" [value]="val">{{ val }}</option>
    </select>
  </div>
</ng-template>
<ng-template #booleanFilter let-prop let-formKey='formKey'>
  <div class="mb-4">
    <label [for]="'trait-search-filters-' + formKey">{{ prop }}</label>
    <input type="checkbox" [id]="'trait-search-filters-' + formKey" [formControl]="form.get(formKey)">
  </div>
</ng-template>
`
})
export class TraitSearchAdditionalFiltersComponent implements OnInit {
  @Input() initialValue: FormChangeType;
  @Output() filterChange: Observable<FormChangeType>;

  form: FormGroup<Record<keyof typeof additionalFilters, FormControl>>;
  additionalFilters!: AdditionalFilterWithFormKey[];
  additionalFiltersLookup = additionalFilters;
  unselectedAdditionalFilters = new Set<number>();
  selectedAdditionalFilters = new Set<number>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(filterDefaultValues);
    this.filterChange = this.form.valueChanges;
    this.additionalFilters = additionalFilterArr;
    this.additionalFilters.forEach((item, idx) => {
      this.unselectedAdditionalFilters.add(idx);
    });
  }

  ngOnInit(): void {
    if (this.initialValue) {
      this.form.setValue({ ...filterDefaultValues, ...this.initialValue });
      Object.entries(this.initialValue).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          const idx = this.additionalFilters.findIndex(f => f.formKey === k);
          this.unselectedAdditionalFilters.delete(idx);
          this.selectedAdditionalFilters.add(idx);
        }
      });
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
