import {
  ApplicationRef,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  Output,
  ViewContainerRef
} from '@angular/core';
import { InformalTaxonGroupApi } from '../../shared/api/InformalTaxonGroupApi';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../../shared/logger/logger.service';

export const OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ObservationGroupSelectComponent),
  multi: true
};

@Component({
  selector: 'observation-group-select',
  templateUrl: './group-select.component.html',
  styleUrls: ['./group-select.component.css'],
  providers: [InformalTaxonGroupApi, OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationGroupSelectComponent implements ControlValueAccessor, OnChanges {
  @Input() lang = 'fi';
  @Input() position: 'right'|'left' = 'right';
  @Output() onSelect = new EventEmitter();

  public groups: InformalTaxonGroup[] = [];
  public activeGroup: InformalTaxonGroup;
  public open = false;
  public innerValue = '';
  public currentValue: string;
  public label = '';
  public range: number[];
  private el: Element;

  private subLabel: any;

  onChange = (_: any) => {
  };
  onTouched = () => {
  };

  get value(): any {
    return this.innerValue;
  };

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  constructor(
    private cd: ChangeDetectorRef,
    private informalTaxonService: InformalTaxonGroupApi,
    private logger: Logger
  ) { }

  ngOnChanges() {
    this.initGroups();
  }

  initGroups() {
    let newValue = this.value;
    newValue = newValue ? newValue : '';
    if (this.currentValue === newValue) {
      return;
    }
    this.currentValue = newValue;
    (newValue ?
      this.informalTaxonService.informalTaxonGroupGetChildren(newValue, this.lang) :
      this.informalTaxonService.informalTaxonGroupFindRoots(this.lang))
      .switchMap(data => {
        return (!data.results || data.results.length === 0) ?
          this.informalTaxonService.informalTaxonGroupGetWithSiblings(newValue, this.lang) :
          Observable.of(data);
      })
      .map(data => data.results.map(item => ({id: item.id, name: item.name, hasSubGroup: item.hasSubGroup})))
      .subscribe(
        groups => {
          this.groups = groups;
          this.initRange();
          this.cd.markForCheck();
        },
        err => {
          this.logger.warn('Was unable to fetch informal taxon group data', err);
          this.cd.markForCheck();
        }
      );
  }

  onClick(group: InformalTaxonGroup) {
    this.value = group.id;
    this.setLabel(group.id);
    this.activeGroup = group;
    if (!!group.hasSubGroup) {
      this.initGroups();
    } else {
      this.close();
    }
  }

  initRange() {
    this.range = [];
    let i, len;
    for (i = 0, len = Math.ceil(this.groups.length / 2); i < len; i++) {
      this.range.push(i);
    }
    return this.range;
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.setLabel(value);
      this.initGroups();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setLabel(groupId: string) {
    if (!groupId) {
      this.label = '';
      return;
    }
    if (this.activeGroup && this.activeGroup.id === groupId) {
      this.label = this.activeGroup.name;
      return;
    }
    let found = false;
    this.groups.map(group => {
      if (group.id === groupId) {
        found = true;
        this.label = group.name;
      }
    });
    if (!found) {
      if (this.subLabel) {
        this.subLabel.unsubscribe();
      }
      this.subLabel = this.informalTaxonService.informalTaxonGroupFindById(groupId, this.lang)
        .map(group => group.name)
        .subscribe(
          name => {
            this.label = name
            this.cd.markForCheck();
          },
          err => {
            this.logger.warn('Unable to find taxon group by id', err);
            this.cd.markForCheck();
          }
        );
    }
  }

  empty() {
    if (this.value === '') {
      return this.close();
    }
    this.value = '';
    if (!this.open) {
      this.onSelect.emit(this.value);
    }
    this.initGroups();
  }

  close() {
    if (!this.open) {
      return;
    }
    this.value = this.innerValue;
    this.onTouched();
    this.open = false;
    this.onSelect.emit(this.innerValue);
  }

  openMenu() {
    this.open = true;
  }

  toggle() {
    if (this.open) {
      return this.close();
    }
    this.open = true;
  }

}
