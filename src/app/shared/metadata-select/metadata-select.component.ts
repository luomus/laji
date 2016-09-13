import {Component, OnInit, Input, OnChanges, OnDestroy, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Subscription} from "rxjs";

import {MetadataApi} from "../api/MetadataApi";

export const METADATA_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MetadataSelectComponent),
  multi: true
};

@Component({
  selector: 'metadata-select',
  templateUrl: 'metadata-select.component.html',
  providers: [METADATA_SELECT_VALUE_ACCESSOR]
})
export class MetadataSelectComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input() field:string;
  @Input() name:string;
  @Input() lang:string = 'fi';

  options = [];

  onChange = (_:any) => {};
  onTouched = () => {};

  private subOptions:Subscription;
  private innerValue:string = '';

  constructor(private metadataService:MetadataApi) { }

  get value(): any {
    return this.innerValue;
  };

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  ngOnInit() {
    this.initOptions();
  }

  ngOnChanges() {
    this.initOptions();
  }

  ngOnDestroy() {
    if (this.subOptions) {
      this.subOptions.unsubscribe();
    }
  }

  initOptions() {
    if (!this.field) {
      return;
    }
    this.subOptions = this.metadataService.metadataFindPropertiesRanges(this.field, this.lang).subscribe(
      data => this.options = data,
      err => console.log(err)
    )
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
