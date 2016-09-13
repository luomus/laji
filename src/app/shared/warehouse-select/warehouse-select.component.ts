import {Component, OnInit, Input, OnChanges, OnDestroy, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Subscription} from "rxjs";

import {MetadataApi} from "../api/MetadataApi";

export const WAREHOUSE_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => WarehouseSelectComponent),
  multi: true
};

@Component({
  selector: 'warehouse-select',
  templateUrl: 'warehouse-select.component.html',
  providers: [WAREHOUSE_SELECT_VALUE_ACCESSOR]
})
export class WarehouseSelectComponent implements ControlValueAccessor {
  @Input() name:string;
  @Input() options = [];

  onChange = (_:any) => {};
  onTouched = () => {};

  private innerValue:string = '';

  get value(): any {
    return this.innerValue;
  };

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  onBlur() {
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
