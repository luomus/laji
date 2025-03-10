import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { InfoCardQueryService } from '../shared/service/info-card-query.service';

@Component({
  selector: 'laji-taxon-occurrence',
  templateUrl: './taxon-occurrence.component.html',
  styleUrls: ['./taxon-occurrence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonOccurrenceComponent implements OnChanges {
  @Input({ required: true }) taxon!: Taxonomy;
  @Input() taxonDescription!: TaxonomyDescription[];
  @Input() isFromMasterChecklist!: boolean;

  mapQuery: WarehouseQueryInterface | undefined;
  chartQuery: WarehouseQueryInterface | undefined;

  hasMonthDayData: boolean | undefined;
  hasYearData: boolean | undefined;
  filterByRecordBasisTotal: number | undefined;
  filterByLifeStageTotal: number | undefined;
  filterBySexTotal: number | undefined;
  filterByCollectionIdTotal: number | undefined;
  filterHabitats: Array<any> = [];

  secureLevelTypes: readonly (keyof Taxonomy)[] = [
    'secureLevel',
    'breedingSecureLevel',
    'naturaAreaSecureLevel',
    'nestSiteSecureLevel',
    'winteringSecureLevel'
  ] as const;

  ngOnChanges() {
    this.mapQuery = InfoCardQueryService.getFinnishObservationQuery(this.taxon.id, true);
    this.chartQuery = InfoCardQueryService.getFinnishObservationQuery(this.taxon.id);
    this.hasMonthDayData = undefined;
    this.hasYearData = undefined;
    this.hasMonthDayData = undefined;
    this.hasYearData = undefined;
    this.filterByRecordBasisTotal = undefined;
    this.filterByLifeStageTotal = undefined;
    this.filterBySexTotal = undefined;
    this.filterByCollectionIdTotal = undefined;

    this.filterHabitats = this.taxon.habitatOccurrenceCounts ?? [];
  }
}
