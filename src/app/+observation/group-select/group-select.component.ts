import {
  Component, OnInit, Input, OnChanges, forwardRef, EventEmitter, Output, HostListener,
  ViewContainerRef
} from '@angular/core';
import {InformalTaxonGroupApi} from "../../shared/api/InformalTaxonGroupApi";
import {InformalTaxonGroup} from "../../shared/model/InformalTaxonGroup";
import {NG_VALUE_ACCESSOR} from "@angular/forms";
import {Observable, Subscription} from "rxjs";
import {PagedResult} from "../../shared/model/PagedResult";

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
export class ObservationGroupSelectComponent implements OnChanges {
  @Input() lang = 'fi';
  @Output() onSelect = new EventEmitter();

  public groups:InformalTaxonGroup[] = [];
  public activeGroup:InformalTaxonGroup;
  public open:boolean = false;
  public innerValue:string = '';
  private el: Element;

  private subLabel:any;

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

  constructor(viewContainerRef: ViewContainerRef, private informalTaxonService:InformalTaxonGroupApi) {
    this.el = viewContainerRef.element.nativeElement;
  }

  @HostListener('body:click', ['$event.target'])
  onHostClick(target) {
    if (!this.open || !target) {
      return;
    }
    if (this.el !== target && !this.el.contains((<any>target))) {
      this.close();
    }
  }

  ngOnChanges() {
    this.initGroups();
  }

  initGroups() {
    let roots$ = this.informalTaxonService.informalTaxonGroupFindRoots(this.lang);
    let children$ = this.informalTaxonService.informalTaxonGroupGetChildren(this.value, this.lang);
    (this.value ? children$ : roots$)
      .switchMap(data => {
        return (!data.results || data.results.length == 0) ?
          this.informalTaxonService.informalTaxonGroupGetWithSiblings(this.value, this.lang) :
          Observable.of(data);
      })
      .map(data => data.results.map(item => ({id: item.id, name: item.name, hasSubGroup: item.hasSubGroup})))
      .subscribe(
        groups => this.groups = groups,
        err => console.log(err)
      )
  }

  onClick(group:InformalTaxonGroup) {
    this.value = group.id;
    this.activeGroup = group;
    if (!!group.hasSubGroup) {
      this.initGroups();
    } else {
      this.close();
    }
  }

  getRange() {
    let items = [], i, len;
    for(i = 0, len = Math.ceil(this.groups.length / 2); i<len; i++) {
      items.push(i);
    }
    return items;
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      if (value) {
        this.initGroups();
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  getLabel(groupId:string) {
    if (!groupId) {
      return Observable.of('');
    }
    if (this.activeGroup && this.activeGroup.id === groupId) {
      return Observable.of(this.activeGroup.name);
    }
    this.groups.map(group => {
      if (group.id === groupId) {
        return Observable.of(group.name);
      }
    });
    if (!this.subLabel) {
      this.subLabel = this.informalTaxonService.informalTaxonGroupFindById(groupId, this.lang)
        .map(group => group.name);
    }
    return this.subLabel;
  }

  empty() {
    this.value = '';
    if (!this.open) {
      this.onSelect.emit(this.value);
    }
    this.initGroups();
  }

  close() {
    this.value = this.innerValue;
    this.onTouched();
    this.open = false;
    this.onSelect.emit(this.innerValue);
  }

  toggle() {
    if (this.open) {
      return this.close();
    }
    this.open = true;
  }

}
