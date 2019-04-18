import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {Taxonomy, TaxonomyDescription} from '../../../../shared/model/Taxonomy';
import {WarehouseQueryInterface} from '../../../../shared/model/WarehouseQueryInterface';
import {InfoCardQueryService} from '../shared/service/info-card-query.service';

@Component({
  selector: 'laji-taxon-occurrence',
  templateUrl: './taxon-occurrence.component.html',
  styleUrls: ['./taxon-occurrence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonOccurrenceComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonDescription: TaxonomyDescription[];
  @Input() isFromMasterChecklist: boolean;

  mapQuery: WarehouseQueryInterface;
  chartQuery: WarehouseQueryInterface;

  hasMonthDayData: boolean;

  constructor() { }

  ngOnChanges() {
    this.mapQuery = InfoCardQueryService.getFinnishObservationQuery(this.taxon.id, true);
    this.chartQuery = InfoCardQueryService.getFinnishObservationQuery(this.taxon.id);

    this.hasMonthDayData = undefined;
  }

}
