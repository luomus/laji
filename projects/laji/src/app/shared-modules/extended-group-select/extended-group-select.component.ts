/* tslint:disable:no-use-before-declare */
import { map, shareReplay } from 'rxjs/operators';
import { ChangeDetectorRef, EventEmitter, Input, OnInit, OnChanges, Output, Directive } from '@angular/core';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { Observable, of } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { PagedResult } from '../../shared/model/PagedResult';
import { SelectedOption, TreeOptionsChangeEvent, TreeOptionsNode } from '../tree-select/tree-select.component';
import { Util } from '../../shared/service/util.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { RedListTaxonGroup } from '../../shared/model/RedListTaxonGroup';
import { ArrayResult } from '../../shared/model/ArrayResult';

export interface InformalGroupEvent {
  [key: string]: string[];
}

@Directive()
export abstract class ExtendedGroupSelectComponent<T extends RedListTaxonGroup|InformalTaxonGroup> implements OnInit, OnChanges {
  @Input() query!: WarehouseQueryInterface;
  @Input() modalButtonLabel = '';
  @Input() modalTitle = '';
  @Input() browseTitle = '';
  @Input() selectedTitle = '';
  @Input() includedTitle = '';
  @Input() excludedTitle = '';
  @Input() okButtonLabel = '';
  @Input() clearButtonLabel = '';
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() select = new EventEmitter<InformalGroupEvent>();

  redList = false;

  groupsTree$!: Observable<TreeOptionsNode[]>;
  groups$!: Observable<SelectedOption[]>;

  includedOptions: string[] = [];
  excludedOptions: string[] = [];

  protected constructor(
    protected cd: ChangeDetectorRef,
    protected logger: Logger,
    protected translate: TranslateService
  ) {}

  ngOnInit() {
    const lang = this.translate.currentLang;
    this.groupsTree$ = this.initGroupTree(lang).pipe(shareReplay(1));
    this.groups$ = this.initSelectionGroups(lang, this.includedOptions, this.excludedOptions);
  }

  ngOnChanges() {
    const [ includedOptions, excludedOptions ] = this.getOptions(this.query);
    if (!Util.equalsArray(this.includedOptions, includedOptions) || !Util.equalsArray(this.excludedOptions, excludedOptions)) {
      this.includedOptions = includedOptions;
      this.excludedOptions = excludedOptions;
      this.groups$ = this.initSelectionGroups(this.translate.currentLang, this.includedOptions, this.excludedOptions);
    }
  }

  abstract findByIds(groupIds: string[], lang: string): Observable<PagedResult<T>>;
  abstract convertToInformalTaxonGroup(group: T): InformalTaxonGroup;
  abstract getTree(lang: string): Observable<ArrayResult<T>>;
  abstract getOptions(query: Record<string, any>): string[][];
  abstract prepareEmit(includedOptions: string[], excludedOptions?: string[]): InformalGroupEvent;

  initGroupTree(lang: string): Observable<TreeOptionsNode[]> {
    return this.getTree(lang).pipe(
      map((data) => data.results),
      map((trees) => this.buildGroupTree(trees))
    );
  }

  buildGroupTree(trees: T[]): TreeOptionsNode[] {
    const groupsWithChildren: TreeOptionsNode[] = [];

    trees.forEach(tree => {
      const prunedTree = this.buildTree(this.convertToInformalTaxonGroup(tree));

      if (prunedTree) {
        groupsWithChildren.push(prunedTree);
      }
    });

    return groupsWithChildren;
  }

  buildTree(tree: InformalTaxonGroup): TreeOptionsNode {
    if (!!tree.hasSubGroup) {
      const children: TreeOptionsNode[] = [];
      tree.hasSubGroup.forEach(subTree => {
        if (typeof subTree === 'string') {
          return;
        }

        const child = this.buildTree(this.convertToInformalTaxonGroup(subTree as T));

        if (child) {
          children.push(child);
        }
      });

      return {
        id: tree.id,
        name: tree.name ?? tree.id,
        children,
        };
    } else {
      return {
        id: tree.id,
        name: tree.name ?? tree.id,
      };
    }
  }

  initSelectionGroups(lang: string, includedOptions: string[], excludedOptions: string[]): Observable<SelectedOption[]> {
    const selectedGroups = includedOptions.concat(excludedOptions);

    if (selectedGroups.length === 0) {
      return of([]);
    } else {
      return this.findByIds(selectedGroups, lang).pipe(
        map(data => data.results),
        map(data => {
          const toReturn: SelectedOption[] = [];
          data.forEach(item => {
            if (includedOptions.includes(item.id)) {
              toReturn.push({
                id: item.id,
                value: item.name ?? item.id,
                type: 'included'
              });
            } else if (excludedOptions.includes(item.id)) {
              toReturn.push({
                id: item.id,
                value: item.name ?? item.id,
                type: 'excluded'
              });
            }
          });
          return toReturn;
        })
      );
    }
  }

  selectedOptionsChange($event: TreeOptionsChangeEvent) {
    this.includedOptions = $event.selectedId ?? [];
    this.excludedOptions = $event.selectedIdNot ?? [];
    this.select.emit(this.prepareEmit(this.includedOptions, this.excludedOptions));
  }
}
