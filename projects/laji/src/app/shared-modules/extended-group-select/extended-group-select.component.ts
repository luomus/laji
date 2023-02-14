/* tslint:disable:no-use-before-declare */
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { ChangeDetectorRef, EventEmitter, Input, OnInit, OnChanges, Output, Directive } from '@angular/core';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { Group } from '../../shared/model/Group';
import { PagedResult } from '../../shared/model/PagedResult';
import { SelectedOption, TreeOptionsChangeEvent, TreeOptionsNode } from '../tree-select/tree-select.component';
import { Util } from '../../shared/service/util.service';

export interface InformalGroupEvent {
  [key: string]: string[];
}

@Directive()
export abstract class ExtendedGroupSelectComponent<T extends Group> implements OnInit, OnChanges {
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

  groupsTree$: Observable<TreeOptionsNode[]>;
  groups$: Observable<SelectedOption[]>;

  private selectedGroups$ = new BehaviorSubject([]);

  protected constructor(
    protected cd: ChangeDetectorRef,
    protected logger: Logger,
    protected translate: TranslateService
  ) {}

  ngOnInit() {
    const lang = this.translate.currentLang;
    this.groupsTree$ = this.initGroupTree(lang).pipe(
      shareReplay(1)
    );
    this.groups$ = this.initSelectionGroups(lang);
  }

  ngOnChanges() {
    const [ includedOptions, excludedOptions ] = this.getOptions(this.query);
    if (!Util.equalsArray(this.includedOptions, includedOptions) || !Util.equalsArray(this.excludedOptions, excludedOptions)) {
      this.includedOptions = includedOptions;
      this.excludedOptions = excludedOptions;
      this.selectedGroups$.next(this.includedOptions.concat(this.excludedOptions));
    }
  }

  abstract findByIds(groupIds, lang): Observable<PagedResult<T>>;
  abstract convertToInformalTaxonGroup(group: T): InformalTaxonGroup;
  abstract getTree(lang): Observable<PagedResult<T>>;
  abstract getOptions(query: Record<string, any>): string[][];
  abstract prepareEmit(includedOptions: string[], excludedOptions?: string[]): InformalGroupEvent;

  initGroupTree(lang: string): Observable<TreeOptionsNode[]> {
    return this.getTree(lang).pipe(
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

  initSelectionGroups(lang: string): Observable<SelectedOption[]> {
    return this.selectedGroups$.pipe(switchMap(selectedGroups => {
      if (selectedGroups.length === 0) {
        return of([]);
      } else {
        return this.findByIds(selectedGroups, lang).pipe(
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
    }));
  }

  selectedOptionsChange($event: TreeOptionsChangeEvent) {
    this.select.emit(this.prepareEmit($event.selectedId, $event.selectedIdNot));
  }
}
