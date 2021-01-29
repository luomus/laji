import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-endangerment',
  templateUrl: './taxon-endangerment.component.html',
  styleUrls: ['./taxon-endangerment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonEndangermentComponent {
  @Input() taxon: Taxonomy;
}
