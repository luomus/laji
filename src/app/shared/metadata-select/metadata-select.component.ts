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
  @Input() alt:string;
  @Input() name:string;
  @Input() multiple:boolean = false;
  @Input() lang:string = 'fi';
  @Input() placeholder = '';
  @Input() mapToWarehouse = false;
  @Input() pick:MetadataSelectPick;

  options = [];
  active = [];

  onChange = (_:any) => {};
  onTouched = () => {};

  private subOptions:Subscription;
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

  ngOnChanges(changes) {
    this.initOptions();
  }

  ngOnDestroy() {
    if (this.subOptions) {
      this.subOptions.unsubscribe();
    }
  }

  initOptions() {
    if (!this.field && !this.alt) {
      return;
    }

    const options$ = this.field ?
      this.metadataService.metadataFindPropertiesRanges(this.field, this.lang, false, true) :
      this.metadataService.metadataFindRange(this.alt, this.lang);

    this.subOptions = options$
      .map(result => this.pickValue(result))
      .switchMap(options => {
        if (this.mapToWarehouse) {
          let requests = [];
          options.map(item => {
            requests.push(this.warehouseMapper.getWarehouseKey(item.id))
          });
          return Observable
            .forkJoin(requests)
            .map(mapping => options.map((item, idx) => ({id:mapping[idx], text: item.text})));
        } else {
          return Observable.of(options);
        }
      })
      .subscribe(
        options => {
          this.options = options;
          this.initActive();
        },
        err => console.log(err)
      )
  }

  private pickValue(data) {
    if (!this.pick) {
      return data.map(value => ({id: value.id,text: value.value}));
    }
    let result = [];
    data.map(item => {
      if (typeof this.pick[item.id] !== 'undefined') {
        if (this.pick[item.id] === '') {
          result.push({id: item.id,text: item.value})
        }
      }
    });
    return result;
  }

  initActive():any {
    if (!this.value) {
      this.active = [];
      return;
    }
    if (typeof this.value === 'string') {
      this.active = this.options.filter(option => this.value === option.id);
    } else {
      this.active = this.options.filter(option => this.value.indexOf(option.id) > -1);
    }
  }

  public refreshValue(value:any):void {
    if (value.id) {
      this.value = value.id;
    } else if (typeof value === 'string') {
      this.value = value;
    }else {
      try {
        this.value = value.map(item => item.id);
      } catch (e) {
        this.value = ''
      }
    }
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.initActive()
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
