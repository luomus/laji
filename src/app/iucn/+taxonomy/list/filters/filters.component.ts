import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListType } from '../list.component';
import { FilterQuery } from '../../../iucn-shared/service/result.service';
import {Observable} from 'rxjs';
import {SelectOption} from '../select/select.component';
import {TaxonService} from '../../../iucn-shared/service/taxon.service';
import {map} from 'rxjs/operators';
import {RedListTaxonGroup} from '../../../../shared/model/RedListTaxonGroup';

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

  constructor(
    private taxonService: TaxonService
  ) { }

  ngOnInit() {
    this.redListStatuses$ = this.taxonService.getRedListStatusTree(this.lang).pipe(
      map(tree => this.mapStatusesToOptions(tree))
    );
  }

  change(param, value) {
    const newQuery = {...this.query, [param]: value};
    this.queryChange.emit(newQuery);
  }

  private mapStatusesToOptions(groups: RedListTaxonGroup[], result: SelectOption[] = [], level = 0): SelectOption[] {
    groups.forEach(group => {
      if (typeof group === 'string') {
        group = {name: group, id: group}
      }
      const label = '&nbsp;'.repeat(level * 4) + (group.name || group.id);
      result.push({value: group.id, label: label});
      if (group.hasIucnSubGroup) {
        this.mapStatusesToOptions(group.hasIucnSubGroup as RedListTaxonGroup[], result, level + 1);
      }
    });
    return result;
  }

}
