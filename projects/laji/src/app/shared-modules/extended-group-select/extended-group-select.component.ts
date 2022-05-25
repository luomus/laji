/* tslint:disable:no-use-before-declare */
import { map } from 'rxjs/operators';
import { ChangeDetectorRef, EventEmitter, Input, OnChanges, Output, Directive, OnInit } from '@angular/core';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { Observable } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { Group } from '../../shared/model/Group';
import { PagedResult } from '../../shared/model/PagedResult';
import { SelectedOption, TreeOptionsChangeEvent, TreeOptionsNode } from '../tree-select/tree-select.component';

export interface InformalGroupEvent {
  [key: string]: string[];
}

@Directive()
export abstract class ExtendedGroupSelectComponent<T extends Group> implements OnChanges {
  @Input() query: Record<string, any>;
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

  lang: string;
  includedOptions: string[] = [];
  excludedOptions: string[] = [];
  redList = false;

  public groups: InformalTaxonGroup[] = [];
  public activeGroup: InformalTaxonGroup;
  public open = false;
  public currentValue: string;
  public label = '';
  protected subLabel: any;

  groupsTree$: Observable<TreeOptionsNode[]> = null;
  groups$: Observable<SelectedOption[]> = null;

  protected constructor(
    protected cd: ChangeDetectorRef,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    this.lang = this.translate.currentLang;
  }

  ngOnChanges() {
    [ this.includedOptions, this.excludedOptions ] = this.getOptions(this.query);

    this.groupsTree$ = this.initGroupTree();
    this.groups$ = this.initSelectionGroups();
  }

  abstract findByIds(groupIds, lang): Observable<PagedResult<T>>;
  abstract convertToInformalTaxonGroup(group: T): InformalTaxonGroup;
  abstract getTree(lang): Observable<PagedResult<T>>;
  abstract getOptions(query: Record<string, any>): string[][];
  abstract prepareEmit(includedOptions: string[], excludedOptions?: string[]): InformalGroupEvent;

  initGroupTree(): Observable<TreeOptionsNode[]> {
    return this.getTree(this.lang).pipe(
      map((data) => data.results),
      map((trees) => this.buildGroupTree(trees))
    );
  }

  buildGroupTree(trees: any[]): TreeOptionsNode[] {
    const groupsWithChildren = [];

    trees.forEach(tree => {
      const prunedTree = this.buildTree(this.convertToInformalTaxonGroup(tree));

      if (prunedTree) {
        groupsWithChildren.push(prunedTree);
      }
    });

    return groupsWithChildren;
  }

  buildTree(tree): TreeOptionsNode {
    if (!!tree.hasSubGroup) {
      const children = tree.hasSubGroup.map(subTree => this.buildTree(this.convertToInformalTaxonGroup(subTree)));

      return {
        id: tree.id,
        name: tree.name,
        children,
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

  selectedOptionsChange($event: TreeOptionsChangeEvent) {
    this.includedOptions = $event.selectedId;
    this.excludedOptions = $event.selectedIdNot;

    this.select.emit(this.prepareEmit(this.includedOptions, this.excludedOptions));
  }
}
