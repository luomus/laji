import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type TaxonDescription = components['schemas']['Content'][number];

@Component({
  selector: 'laji-taxon-description-source',
  templateUrl: './taxon-description-source.component.html',
  styleUrls: ['./taxon-description-source.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonDescriptionSourceComponent implements OnChanges {
  @Input() taxonDescription!: TaxonDescription;

  currentLang: string | undefined;

  constructor(private checklang: TranslateService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonDescription) {
      this.currentLang = this.checklang.currentLang;
    }
  }

}
