/* tslint:disable:no-use-before-declare */
import { map, switchMap } from 'rxjs/operators';
import { ChangeDetectorRef, EventEmitter, Input, OnChanges, Output, Directive, OnInit } from '@angular/core';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { Observable, of as ObservableOf } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { Group } from '../../shared/model/Group';
import { PagedResult } from '../../shared/model/PagedResult';
import { SelectedOption, OptionsTreeNode } from '../tree-select/tree-select.component';

interface InformalTaxonGroupEvent {
  informalTaxonGroupId?: string[];
  informalTaxonGroupIdNot?: string[];
}

interface RedlistGroupEvent {
  redListGroup: string[];
}

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class ExtendedGroupSelectComponent<T extends Group> implements OnInit, OnChanges {
  @Input() query: Record<string, any>;
  @Input() position: 'right'|'left' = 'right';
  @Input() rootGroups: string[];
  @Input() useAdvanced = false;
  @Input() modalButtonLabel = '';
  @Input() modalTitle = '';
  @Input() browseTitle = '';
  @Input() selectedTitle = '';
  @Input() okButtonLabel = '';
  @Input() clearButtonLabel = '';
  @Output() select = new EventEmitter<InformalTaxonGroupEvent | RedlistGroupEvent>();

  lang: string;
  includedOptions: string[] = [];
  excludedOptions: string[] = [];

  public groups: InformalTaxonGroup[] = [];
  public activeGroup: InformalTaxonGroup;
  public open = false;
  public currentValue: string;
  public label = '';
  public range: number[];
  public advanced = false;
  protected subLabel: any;

  groupsTree$: Observable<OptionsTreeNode[]> = null;
  groups$: Observable<SelectedOption[]> = null;

  onChange = (_: any) => {
  }
  onTouched = () => {
  }

  get value(): any {
    return this.includedOptions[0];
  }

  set value(v: any) {
    if (v !== this.includedOptions[0]) {
      this.includedOptions[0] = v;
      this.excludedOptions = [];
      this.onChange(v);
    }
  }

  protected constructor(
    protected cd: ChangeDetectorRef,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    this.lang = this.translate.currentLang;
  }

  ngOnInit() {
    this.setLabel(this.includedOptions[0]);
    this.initGroups();
    this.cd.markForCheck();
  }

  ngOnChanges() {
    [ this.includedOptions, this.excludedOptions ] = this.getOptions(this.query);

    if (this.includedOptions.length > 1 || this.excludedOptions.length > 0) {
      this.advanced = true;
    }

    this.value = this.includedOptions[0];

    if (!this.advanced) {
      this.initGroups();
    }

    this.groupsTree$ = this.initGroupTree();
    this.groups$ = this.initSelectionGroups();
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
      this.getRoot(this.lang)).pipe(
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

  getRoot(lang): Observable<PagedResult<T>> {
    if (this.rootGroups) {
      return this.findByIds(this.rootGroups, lang);
    }
    return this.findRoots(lang);
  }

  abstract findById(groupId, lang): Observable<T>;
  abstract findByIds(groupIds, lang): Observable<PagedResult<T>>;
  abstract getWithSiblings(groupId, lang): Observable<PagedResult<T>>;
  abstract getChildren(groupId, lang): Observable<PagedResult<T>>;
  abstract findRoots(lang): Observable<PagedResult<T>>;
  abstract convertToInformalTaxonGroup(group: T): InformalTaxonGroup;
  abstract getTree(lang): Observable<PagedResult<T>>;
  abstract getOptions(query: Record<string, any>): string[][];
  abstract prepareEmit(includedOptions: string[], excludedOptions: string[]): InformalTaxonGroupEvent | RedlistGroupEvent;

  empty() {
    if (this.value === '') {
      return this.close();
    }
    this.value = '';
    if (!this.open) {
      this.select.emit(this.prepareEmit(this.includedOptions, this.excludedOptions));
    }
    this.initGroups();
  }

  close() {
    if (!this.open) {
      return;
    }
    this.value = this.includedOptions[0];
    this.onTouched();
    this.open = false;
    this.select.emit(this.prepareEmit(this.includedOptions, this.excludedOptions));
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

  toggleAdvancedMode() {
    this.advanced = !this.advanced;
  }

  initGroupTree() {
    return this.getTree(this.lang).pipe(
      map((data) => data.results),
      map((trees) => this.buildGroupTree(trees))
    );
  }

  buildGroupTree(trees: any[]) {
    const groupsWithChildren = [];

    trees.forEach(tree => {
      const prunedTree = this.buildTree(tree);

      if (prunedTree) {
        groupsWithChildren.push(prunedTree);
      }
    });

    return groupsWithChildren;
  }

  buildTree(tree): OptionsTreeNode {
    if (!!tree.hasSubGroup) {
      return {
        id: tree.id,
        name: tree.name,
        children: tree.hasSubGroup,
        };
    } else {
      return {
        id: tree.id,
        name: tree.longName,
      };
    }
  }

  initSelectionGroups(): Observable<SelectedOption[]> {
    const selectedGroups = this.includedOptions.concat(this.excludedOptions);

    return this.findByIds(selectedGroups, this.lang).pipe(
      map(data => data.results),
      map(data => {
        const toReturn: SelectedOption[] = [];
        data.forEach(item => {
          if (this.includedOptions.includes(item.id)) {
            toReturn.push({
              id: item.id,
              value: item.name,
              type: 'included'
            });
          } else if (this.excludedOptions.includes(item.id)) {
            toReturn.push({
              id: item.id,
              value: item.name,
              type: 'excluded'
            });
          }
        });
        return toReturn;
      })
    );
  }

  selectedOptionsChange($event) {
    this.includedOptions = $event.selectedId;
    this.excludedOptions = $event.selectedIdNot;

    this.select.emit(this.prepareEmit(this.includedOptions, this.excludedOptions));
  }
}
