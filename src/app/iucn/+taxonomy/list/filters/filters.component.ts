import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListType } from '../list.component';
import { FilterQuery } from '../../../iucn-shared/service/result.service';
import {Observable} from 'rxjs';
import {SelectOption} from '../select/select.component';
import {TaxonService} from '../../../iucn-shared/service/taxon.service';
import { map } from 'rxjs/operators';
import { RedListTaxonGroup } from '../../../../shared/model/RedListTaxonGroup';
import { MetadataService } from '../../../../shared/service/metadata.service';
import { MultiLangService } from '../../../../shared-modules/lang/service/multi-lang.service';

@Component({
  selector: 'laji-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  @Input() lang: string;
  @Input() type: ListType;
  @Input() query: FilterQuery;
  @Output() queryChange = new EventEmitter<FilterQuery>();

  redListStatuses$: Observable<SelectOption[]>;
  threadReasons$: Observable<SelectOption[]>;
  habitats$: Observable<SelectOption[]>;
  showStatusSelect = false;

  constructor(
    private taxonService: TaxonService,
    private metadataService: MetadataService
  ) { }

  ngOnInit() {
    this.redListStatuses$ = this.taxonService.getRedListStatusTree(this.lang).pipe(
      map(tree => this.mapStatusesToOptions(tree))
    );
    this.threadReasons$ = this.metadataService.getRange('MKV.endangermentReasonEnum').pipe(
      map(meta => this.mapMetadataToOptions(meta))
    );
    this.habitats$ = this.metadataService.getRange('MKV.habitatEnum').pipe(
      map(meta => this.mapMetadataToOptions(meta))
    );
  }

  change(param, value) {
    const newQuery = {...this.query, [param]: value};
    this.queryChange.emit(newQuery);
  }

  private mapMetadataToOptions(meta: any[]): SelectOption[] {
    return meta.map(options => ({value: options.id, label: MultiLangService.getValue(options.value, this.lang)}));
  }

  private mapStatusesToOptions(groups: RedListTaxonGroup[], result: SelectOption[] = [], level = 0): SelectOption[] {
    groups.forEach(group => {
      if (typeof group === 'string') {
        group = {name: group, id: group};
      }
      const label = '&nbsp;'.repeat(level * 4) + (group.name || group.id);
      result.push({value: group.id, label: label});
      if (group.hasIucnSubGroup) {
        this.mapStatusesToOptions(group.hasIucnSubGroup as RedListTaxonGroup[], result, level + 1);
      }
    });
    return result;
  }

  toggleStatus() {
    this.showStatusSelect = !this.showStatusSelect;
  }

  clear() {
    const {taxon, redListGroup, habitat, threats, reasons, status, ...rest} = this.query;
    this.queryChange.emit(rest);
  }
}
