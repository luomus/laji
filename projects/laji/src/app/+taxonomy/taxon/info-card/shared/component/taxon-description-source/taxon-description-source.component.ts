import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TaxonomyDescription } from '../../../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-taxon-description-source',
  templateUrl: './taxon-description-source.component.html',
  styleUrls: ['./taxon-description-source.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonDescriptionSourceComponent implements OnChanges {
  @Input() taxonDescription: TaxonomyDescription;

  currentLang: string;

  constructor(private checklang: TranslateService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonDescription) {
      this.currentLang = this.checklang.currentLang;
    }
  }

}
