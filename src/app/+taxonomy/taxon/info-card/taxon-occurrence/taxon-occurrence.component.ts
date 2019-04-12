import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {Taxonomy, TaxonomyDescription} from '../../../../shared/model/Taxonomy';

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

  hasMonthDayData: boolean;

  constructor() { }

  ngOnChanges() {
    this.hasMonthDayData = undefined;
  }

}
