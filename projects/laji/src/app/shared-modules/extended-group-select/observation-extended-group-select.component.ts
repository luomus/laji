import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  OnInit,
  OnChanges
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { components } from 'projects/laji-api-client/generated/api.d';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { map, Observable, of, shareReplay } from 'rxjs';
import { SelectedOption, TreeOptionsChangeEvent, TreeOptionsNode } from '../tree-select/tree-select.component';
import { equalsArray } from '../../shared/utils';

type InformalTaxonGroup = components['schemas']['store-informalTaxonGroup'];

interface InformalGroupEvent {
  [key: string]: string[];
}

export const OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ObservationExtendedGroupSelectComponent),
  multi: true
};

@Component({
    selector: 'laji-observation-extended-group-select',
    templateUrl: './extended-group-select.component.html',
    styleUrls: ['./extended-group-select.component.css'],
    providers: [OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ObservationExtendedGroupSelectComponent implements OnInit, OnChanges {

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

  constructor(private api: LajiApiClientService) {}

  ngOnInit() {
    this.groupsTree$ = this.initGroupTree().pipe(shareReplay(1));
    this.groups$ = this.initSelectionGroups(this.includedOptions, this.excludedOptions);
  }

  ngOnChanges() {
    const [ includedOptions, excludedOptions ] = this.getOptions();
    if (!equalsArray(this.includedOptions, includedOptions) || !equalsArray(this.excludedOptions, excludedOptions)) {
      this.includedOptions = includedOptions;
      this.excludedOptions = excludedOptions;
      this.groups$ = this.initSelectionGroups(this.includedOptions, this.excludedOptions);
    }
  }

  initGroupTree(): Observable<TreeOptionsNode[]> {
    return this.getTree().pipe(
      map((data) => data.results),
      map((trees) => this.buildGroupTree(trees))
    );
  }

  buildGroupTree(trees: InformalTaxonGroup[]): TreeOptionsNode[] {
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

        const child = this.buildTree(this.convertToInformalTaxonGroup(subTree));

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

  initSelectionGroups(includedOptions: string[], excludedOptions: string[]): Observable<SelectedOption[]> {
    const selectedGroups = includedOptions.concat(excludedOptions);

    if (selectedGroups.length === 0) {
      return of([]);
    } else {
      return this.findByIds(selectedGroups).pipe(
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

  getOptions(): string[][] {
    return [this.query?.informalTaxonGroupId || [], this.query.informalTaxonGroupIdNot || []];
  }

  findByIds(groupIds: string[]) {
    return this.api.get('/informal-taxon-groups', { query: { idIn: groupIds.join(',') }});
  }

  convertToInformalTaxonGroup(group: InformalTaxonGroup): InformalTaxonGroup {
    return {...group};
  }

  getTree() {
    return this.api.get('/informal-taxon-groups/tree');
  }

  prepareEmit(includedOptions: string[], excludedOptions?: string[]): InformalGroupEvent {
    return {
      informalTaxonGroupId: includedOptions,
      informalTaxonGroupIdNot: excludedOptions ?? [],
    };
  }

  selectedOptionsChange($event: TreeOptionsChangeEvent) {
    this.includedOptions = $event.selectedId ?? [];
    this.excludedOptions = $event.selectedIdNot ?? [];
    this.select.emit(this.prepareEmit(this.includedOptions, this.excludedOptions));
  }
}
