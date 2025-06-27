import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];
type SimpleTaxon = components['schemas']['SimpleTaxon'];

type SimpleTaxonArrayKeys = {
  [K in keyof Taxon]: Taxon[K] extends SimpleTaxon[] ? K : never
}[keyof Taxon];

@Component({
  selector: 'laji-taxon-synonyms',
  templateUrl: './taxon-synonyms.component.html',
  styleUrls: ['./taxon-synonyms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSynonymsComponent {
  @Input() taxon!: Taxon;
  @Input() synonymTypes: SimpleTaxonArrayKeys[] = [];
  @Input() hasOtherNamesBefore = false;

}
