import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
         Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { components, paths } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Observable } from 'rxjs';
import { AdditionalFilterValues } from './additional-filters.component';
import { RankFilterValue } from './rank-filter/rank-filter.component';
import { tap } from 'rxjs/operators';

export interface FormValue {
  dataset: string | null;
  trait: string | null;
  rank: RankFilterValue | null;
  additionalFilters: AdditionalFilterValues | null;
};

export const formDefaultValues: FormValue = {
  dataset: null,
  trait: null,
  rank: null,
  additionalFilters: null
};

@Component({
  selector: 'laji-trait-search-filters',
  templateUrl: './trait-search-filters.component.html',
  styleUrls: ['./trait-search-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitSearchFiltersComponent implements OnChanges {
  @Input() initialValue: FormValue | undefined;
  @Output() filterChange: Observable<Partial<FormValue>>;
  @Output() searchClicked = new EventEmitter<void>();

  form = this.fb.group(formDefaultValues);
  datasets$: Observable<components['schemas']['Dataset'][]>;
  traits$: Observable<components['schemas']['Trait'][]>;

  constructor(
    private fb: FormBuilder,
    private api: LajiApiClientBService
  ) {
    this.filterChange = this.form.valueChanges;
    this.datasets$ = this.api.fetch('/trait/datasets', 'get', {});
    this.traits$ = this.api.fetch('/trait/traits', 'get', {});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialValue?.currentValue) {
      Object.entries(changes.initialValue.currentValue).forEach(([k, v]) => {
        this.form.get(k)?.setValue(v === undefined ? null : v, { emitEvent: false });
      });
    }
  }

  onAdditionalFiltersChange(filters: AdditionalFilterValues) {
    this.form.get('additionalFilters')?.setValue(filters);
  }

  onSearch() {
    this.searchClicked.emit();
  }

  onClear() {
    this.form.setValue(formDefaultValues);
  }
}
