import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'laji-conservation-filter',
  templateUrl: `./conservation-filter.component.html`,
  styleUrls: ['./conservation-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConservationFilterComponent {
  @Input() administrativeStatus: string[];
  @Input() redListStatus: string[];
  @Input() set taxonAdminFiltersOperator(val: 'AND' | 'OR') {
    this.form.setValue({operator: val || 'AND'}, { emitEvent: false });
  }
  @Output() administrativeStatusChange = new EventEmitter<string[]>();
  @Output() redListStatusChange = new EventEmitter<string[]>();
  @Output() operatorChange: Observable<'AND' | 'OR'>;

  form: FormGroup;
  constructor(fb: FormBuilder) {
    this.form = fb.group({
      operator: 'AND'
    });
    this.operatorChange = this.form.valueChanges.pipe(
      map(v => v.operator)
    );
  }
}
