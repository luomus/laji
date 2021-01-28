import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-invasive',
  templateUrl: './taxon-invasive.component.html',
  styleUrls: ['./taxon-invasive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInvasiveComponent {
  @Input() taxon: Taxonomy;
  @Input() taxonDescription: TaxonomyDescription[];

}
