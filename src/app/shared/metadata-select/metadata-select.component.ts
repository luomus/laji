import {Component, OnInit, Input, OnChanges, OnDestroy, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Subscription, Observable} from "rxjs";

import {MetadataApi} from "../api/MetadataApi";
import {WarehouseValueMappingService} from "../service/warehouse-value-mapping.service";

export interface MetadataSelectPick {
  [field:string]:string;
}

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
  @Input() mapToWarehouse = false;
  @Input() pick:MetadataSelectPick;

  options = [];

  onChange = (_:any) => {};
  onTouched = () => {};

  private subOptions:Subscription;
  private subKeyMap:Subscription;
  private innerValue:string = '';

  constructor(
    public warehouseMapper:WarehouseValueMappingService,
    private metadataService:MetadataApi
  ) { }

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
      data => this.parseData(data),
      err => console.log(err)
    )
  }

  private parseData(data) {
    if (!data) {
      return;
    }
    data = this.pickValue(data);
    if (this.mapToWarehouse) {
      let requests = [];
      data.map(item => {
        requests.push(this.warehouseMapper.getWarehouseKey(item.id))
      });
      this.subKeyMap = Observable
        .forkJoin(requests)
        .subscribe(result => {
          data.map((item, idx) => {
            data[idx]['id'] = result[idx];
          });
          this.options = data;
        })
    } else {
      this.options = data;
    }
  }

  private pickValue(data) {
    if (!this.pick) {
      return data;
    }
    let result = [];
    data.map(item => {
      if (typeof this.pick[item.id] !== 'undefined') {
        if (this.pick[item.id] === '') {
          result.push(item);
        } else {
          result.push({
            id: item.id,
            value: item.value
          })
        }
      }
    });
    return result;
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
