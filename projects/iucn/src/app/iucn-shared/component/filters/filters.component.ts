import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterQuery } from '../../service/result.service';
import { Observable } from 'rxjs';
import { SelectOption } from '../select/select.component';
import { TaxonService } from '../../service/taxon.service';
import { map } from 'rxjs/operators';
import { RedListTaxonGroup } from '../../../../../../laji/src/app/shared/model/RedListTaxonGroup';
import { MetadataService } from '../../../../../../laji/src/app/shared/service/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { AreaService } from '../../../../../../laji/src/app/shared/service/area.service';
import { Area } from '../../../../../../laji/src/app/shared/model/Area';
import { RegionalFilterQuery } from '../../service/regional.service';

@Component({
  selector: 'iucn-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent {

  @Input() type: 'default'|'status'|'regional' = 'default';
  @Input() query: FilterQuery & RegionalFilterQuery = {};
  @Input() groupSelectRootGroups?: string[];
  @Output() queryChange = new EventEmitter<FilterQuery | RegionalFilterQuery>();

  lang: string;
  redListStatuses$: Observable<SelectOption[]>;
  threadReasons$: Observable<SelectOption[]>;
  habitats$: Observable<SelectOption[]>;
  habitatsSpecific$: Observable<SelectOption[]>;
  evaluationArea$: Observable<SelectOption[]>;
  showStatusSelect = false;

  constructor(
    private taxonService: TaxonService,
    private metadataService: MetadataService,
    private areaService: AreaService,
    private translate: TranslateService
  ) {
    this.lang = this.translate.currentLang;
    this.redListStatuses$ = this.taxonService.getRedListStatusTree(this.lang).pipe(
      map(tree => this.mapStatusesToOptions(tree))
    );
    this.threadReasons$ = this.metadataService.getRange('MKV.endangermentReasonEnum').pipe(
      map(meta => this.mapMetadataToOptions(meta))
    );
    this.habitats$ = this.metadataService.getRange('MKV.habitatEnum').pipe(
      map(meta => this.mapMetadataToOptions(meta))
    );
    this.habitatsSpecific$ = this.metadataService.getRange('MKV.habitatSpecificTypeEnum').pipe(
      map(meta => this.mapMetadataToOptions(meta))
    );
    this.evaluationArea$ = this.areaService.getAreaType(this.translate.currentLang, Area.AreaType.IucnEvaluationArea).pipe(
      map(meta => this.mapAreaDataToOptions(meta))
    );
   }

  change(param: string, value: any) {
    const newQuery = {...this.query, [param]: value};
    this.queryChange.emit(newQuery);
  }

  private mapMetadataToOptions(meta: any[]): SelectOption[] {
    return meta.map(options => ({value: options.id, label: options.label}));
  }

  private mapAreaDataToOptions(area: {id: string; value: string}[]): SelectOption[] {
    return area.map(options => ({value: options.id, label: options.value}));
  }

  private mapStatusesToOptions(groups: RedListTaxonGroup[], result: SelectOption[] = [], level = 0): SelectOption[] {
    groups.forEach(group => {
      if (typeof group === 'string') {
        group = {name: group, id: group};
      }
      const label = String.fromCharCode(160).repeat(level * 4) + (group.name || group.id);
      result.push({value: group.id, label});
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
    const {
      taxon,
      redListGroup,
      habitat,
      habitatSpecific,
      threatenedAtArea,
      threats,
      reasons,
      status,
      onlyPrimaryThreat,
      onlyPrimaryReason,
      onlyPrimaryHabitat,
      ...rest
    } = this.query;
    this.queryChange.emit(rest);
  }

  habitatChange(value: any) {
    if (!value) {
      const newQuery = {...this.query, habitat: '', habitatSpecific: ''};
      this.queryChange.emit(newQuery);
    } else {
      this.change('habitat', value);
    }
  }
}
