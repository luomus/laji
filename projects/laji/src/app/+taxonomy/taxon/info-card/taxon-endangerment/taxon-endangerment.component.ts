import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

@Component({
  selector: 'laji-taxon-endangerment',
  templateUrl: './taxon-endangerment.component.html',
  styleUrls: ['./taxon-endangerment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonEndangermentComponent {
  @Input({ required: true }) taxon!: Taxon;
}
