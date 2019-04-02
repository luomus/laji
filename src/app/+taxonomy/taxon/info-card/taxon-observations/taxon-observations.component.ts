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

  hasYearData: boolean;

  constructor() { }

  ngOnChanges() {
    this.hasYearData = undefined;
  }

}
