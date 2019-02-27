/* tslint:disable:no-use-before-declare */
import { map, switchMap } from 'rxjs/operators';
import { ChangeDetectorRef, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { ControlValueAccessor } from '@angular/forms';
import { Observable, of as ObservableOf } from 'rxjs';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { Group } from '../model/Group';
import { PagedResult } from '../model/PagedResult';

export abstract class GroupSelectComponent<T extends Group> implements ControlValueAccessor, OnChanges, OnInit {
  @Input() position: 'right'|'left' = 'right';
  @Output() select = new EventEmitter();

  lang: string;
  public groups: InformalTaxonGroup[] = [];
  public activeGroup: InformalTaxonGroup;
  public open = false;
  public innerValue = '';
  public currentValue: string;
  public label = '';
  public range: number[];
  private el: Element;

  protected subLabel: any;

  ngOnInit() {
    this.lang = this.translate.currentLang;
  }

  onChange = (_: any) => {
  }
  onTouched = () => {
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  constructor(
    protected cd: ChangeDetectorRef,
    protected logger: Logger,
    protected translate: TranslateService
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
      this.getChildren(newValue, this.lang) :
      this.findRoots(this.lang)).pipe(
      switchMap(data => {
        return (!data.results || data.results.length === 0) ?
          this.getWithSiblings(newValue, this.lang) :
          ObservableOf(data);
      })).pipe(
      map(data => data.results.map(item => this.convertToInformalTaxonGroup(item))))
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
    this.groups.map((group) => {
      if (group.id === groupId) {
        found = true;
        this.label = group.name;
      }
    });
    if (!found) {
      if (this.subLabel) {
        this.subLabel.unsubscribe();
      }
      this.subLabel = this.findById(groupId, this.lang).pipe(
        map(group => group.name))
        .subscribe(
          name => {
            this.label = name;
            this.cd.markForCheck();
          },
          err => {
            this.logger.warn('Unable to find taxon group by id', err);
            this.cd.markForCheck();
          }
        );
    }
  }

  abstract findById(groupId, lang): Observable<T>;
  abstract getWithSiblings(groupId, lang): Observable<PagedResult<T>>;
  abstract getChildren(groupId, lang): Observable<PagedResult<T>>;
  abstract findRoots(lang): Observable<PagedResult<T>>;
  abstract convertToInformalTaxonGroup(group: T): InformalTaxonGroup;

  empty() {
    if (this.value === '') {
      return this.close();
    }
    this.value = '';
    if (!this.open) {
      this.select.emit(this.value);
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
    this.select.emit(this.innerValue);
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
