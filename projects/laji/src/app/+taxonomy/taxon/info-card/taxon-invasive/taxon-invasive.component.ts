import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];
type TaxonDescription = components['schemas']['Content'][number];

@Component({
  selector: 'laji-taxon-invasive',
  templateUrl: './taxon-invasive.component.html',
  styleUrls: ['./taxon-invasive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInvasiveComponent {
  @Input({ required: true }) taxon!: Taxon;
  @Input() taxonDescription!: TaxonDescription[];

}
