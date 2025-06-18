import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { toHtmlSelectElement } from '../../../../shared/service/html-element.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];
type TaxonDescription = components['schemas']['Content'][number];

@Component({
  selector: 'laji-taxon-biology',
  templateUrl: './taxon-biology.component.html',
  styleUrls: ['./taxon-biology.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonBiologyComponent implements OnChanges {
  @Input({ required: true }) taxon!: Taxon;
  @Input({ required: true }) taxonDescription!: TaxonDescription[];
  @Input({ required: true }) context!: string;

  activeDescription = 0;

  toHtmlSelectElement = toHtmlSelectElement;
  @Output() contextChange = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonDescription || changes.context) {
      this.activeDescription = 0;

      if (this.taxonDescription && this.context) {
        this.taxonDescription.forEach((description, idx) => {
          if (description.id === this.context) {
            this.activeDescription = idx;
          }
        });
      }
    }
  }
}
