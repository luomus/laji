import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-synonyms',
  templateUrl: './taxon-synonyms.component.html',
  styleUrls: ['./taxon-synonyms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSynonymsComponent {
  @Input() taxon: Taxonomy;
  @Input() synonymTypes: string[] = [];
  @Input() hasOtherNamesBefore = false;

}
