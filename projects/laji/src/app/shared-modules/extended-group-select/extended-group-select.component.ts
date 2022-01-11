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
export abstract class ExtendedGroupSelectComponent<T extends Group> implements OnChanges {
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
  redList = false;

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

  get value(): any {
    return this.includedOptions[0];
  }

  set value(v: any) {
    if (v !== this.includedOptions[0]) {
      this.includedOptions[0] = v;
      this.excludedOptions = [];
    }
  }

  protected constructor(
    protected cd: ChangeDetectorRef,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    this.lang = this.translate.currentLang;
  }

  onSimpleSelectorChange() {
    this.select.emit(this.prepareEmit([this.value]));
  }

  ngOnChanges() {
    [ this.includedOptions, this.excludedOptions ] = this.getOptions(this.query);

    if (this.includedOptions.length > 1 || this.excludedOptions.length > 0) {
      this.advanced = true;
    }

    this.value = this.includedOptions[0];

    this.groupsTree$ = this.initGroupTree();
    this.groups$ = this.initSelectionGroups();
  }

  abstract findByIds(groupIds, lang): Observable<PagedResult<T>>;
  abstract convertToInformalTaxonGroup(group: T): InformalTaxonGroup;
  abstract getTree(lang): Observable<PagedResult<T>>;
  abstract getOptions(query: Record<string, any>): string[][];
  abstract prepareEmit(includedOptions: string[], excludedOptions?: string[]): InformalTaxonGroupEvent | RedlistGroupEvent;

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
      const prunedTree = this.buildTree(this.convertToInformalTaxonGroup(tree));

      if (prunedTree) {
        groupsWithChildren.push(prunedTree);
      }
    });

    return groupsWithChildren;
  }

  buildTree(tree): OptionsTreeNode {
    if (!!tree.hasSubGroup) {
      const children = tree.hasSubGroup.map(subTree => this.buildTree(this.convertToInformalTaxonGroup(subTree)));

      return {
        id: tree.id,
        name: tree.name,
        children: children,
        };
    } else {
      return {
        id: tree.id,
        name: tree.name,
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
