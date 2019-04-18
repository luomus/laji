import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {Taxonomy} from '../../../../shared/model/Taxonomy';
import {WarehouseQueryInterface} from '../../../../shared/model/WarehouseQueryInterface';
import {InfoCardQueryService} from '../shared/service/info-card-query.service';

@Component({
  selector: 'laji-taxon-observations',
  templateUrl: './taxon-observations.component.html',
  styleUrls: ['./taxon-observations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonObservationsComponent implements OnChanges {
  @Input() taxon: Taxonomy;

  mapQuery: WarehouseQueryInterface;
  chartQuery: WarehouseQueryInterface;

  hasMonthDayData: boolean;
  hasYearData: boolean;
  filterByRecordBasisTotal: number;
  filterByLifeStageTotal: number;
  filterBySexTotal: number;
  filterByCollectionIdTotal: number;

  constructor() { }

  ngOnChanges() {
    this.mapQuery = InfoCardQueryService.getFinnishObservationQuery(this.taxon.id, true);
    this.chartQuery = InfoCardQueryService.getFinnishObservationQuery(this.taxon.id);

    this.hasMonthDayData = undefined;
    this.hasYearData = undefined;
    this.filterByRecordBasisTotal = undefined;
    this.filterByLifeStageTotal = undefined;
    this.filterBySexTotal = undefined;
    this.filterByCollectionIdTotal = undefined;
  }

}
