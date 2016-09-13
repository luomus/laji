import {Component, OnInit, Input, OnChanges, forwardRef, EventEmitter, Output} from '@angular/core';
import {InformalTaxonGroupApi} from "../../shared/api/InformalTaxonGroupApi";
import {InformalTaxonGroup} from "../../shared/model/InformalTaxonGroup";
import {NG_VALUE_ACCESSOR} from "@angular/forms";

export const OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ObservationGroupSelectComponent),
  multi: true
};

@Component({
  selector: 'observation-group-select',
  templateUrl: 'group-select.component.html',
  styleUrls: ['./group-select.component.css'],
  providers: [ InformalTaxonGroupApi, OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR ]
})
export class ObservationGroupSelectComponent implements OnInit, OnChanges {
  @Input() lang = 'fi';
  @Output() onSelect = new EventEmitter();

  public groups:InformalTaxonGroup[] = [];
  public open:boolean = false;
  private innerValue:string = '';

  onChange = (_:any) => {};
  onTouched = () => {};

  get value(): any {
    return this.innerValue;
  };

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  constructor(private informalTaxonService:InformalTaxonGroupApi) { }

  ngOnInit() {
    this.initGroups();
  }

  ngOnChanges() {
    this.initGroups();
  }

  initGroups() {
    this.informalTaxonService.informalTaxonGroupFindRoots(this.lang)
      .subscribe(
        data => {
          if (data.results) {
            this.groups = data.results.map(item => {
              return {id: item.id, name: item.name}
            });
          }
        }
      )
  }

  hasRootLabel() {
    return this.groups.filter(group => group.id === this.value).length > 0;
  }

  getLabel(value) {
    if (!value) {
      return '';
    }
    return this.groups
      .filter(group => group.id === value)
      .reduce((p,c) => c.name,'');
  }

  onClick(value) {
    this.value = this.value == value ? '': value;
    this.onTouched();
    this.open = false;
    this.onSelect.emit(value);
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

  toggle() {
    this.open = !this.open;
  }

}
