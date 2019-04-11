import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-observations',
  templateUrl: './taxon-observations.component.html',
  styleUrls: ['./taxon-observations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonObservationsComponent implements OnChanges {
  @Input() taxon: Taxonomy;

  hasMonthDayData: boolean;
  hasYearData: boolean;
  filterByRecordBasisTotal: number;
  filterByLifeStageTotal: number;
  filterBySexTotal: number;
  filterByCollectionIdTotal: number;

  constructor() { }

  ngOnChanges() {
    this.hasMonthDayData = undefined;
    this.hasYearData = undefined;
    this.filterByRecordBasisTotal = undefined;
    this.filterByLifeStageTotal = undefined;
    this.filterBySexTotal = undefined;
    this.filterByCollectionIdTotal = undefined;
  }

}
