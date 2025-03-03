import { ChangeDetectionStrategy, Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { components } from 'projects/laji-api-client-b/generated/api';
import { Subscription } from 'rxjs';

type TraitEnumerationValue = components['schemas']['TraitEnumerationValue'];
type TraitEnumerationValueFormGroup = FormGroup<{
  [K in keyof TraitEnumerationValue]: FormControl<TraitEnumerationValue[K]>;
}>;

@Component({
  selector: 'laji-trait-enumeration-value-list',
  templateUrl: './trait-enumeration-value-list.component.html',
  styleUrls: ['./trait-enumeration-value-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TraitEnumerationValueListComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitEnumerationValueListComponent implements ControlValueAccessor, OnInit, OnDestroy {
  form = this.fb.array<TraitEnumerationValueFormGroup>([]);
  onChange: (value: TraitEnumerationValue[]) => void = () => {};
  onTouched: () => void = () => {};
  subscription!: Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.subscription = this.form.valueChanges.subscribe(_ => this.onChange(this.form.getRawValue()));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onAddElem() {
    this.addElem();
    this.onChange(this.form.getRawValue());
  }

  onRemoveElem(index: number) {
    this.form.removeAt(index);
    this.onChange(this.form.getRawValue());
  }

  writeValue(vals: TraitEnumerationValue[] | null): void {
    this.form.clear();
    if (!vals) {
      return;
    }

    vals.forEach(val => {
      this.addElem(val);
    });
  }

  registerOnChange(fn: (value: TraitEnumerationValue[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  private addElem(elem?: TraitEnumerationValue) {
    const group = this.fb.group({
      id: new FormControl(elem?.id ?? '', { nonNullable: true }),
      dataEntryName: new FormControl(elem?.dataEntryName ?? '', { nonNullable: true }),
      name: new FormControl(elem?.name ?? '', { nonNullable: true }),
      description: new FormControl(elem?.description ?? '', { nonNullable: true })
    });
    this.form.push(group);
  }
}

