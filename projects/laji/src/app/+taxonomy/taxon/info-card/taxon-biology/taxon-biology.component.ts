import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';
import { toHtmlSelectElement } from '../../../../shared/service/html-element.service';

@Component({
  selector: 'laji-taxon-biology',
  templateUrl: './taxon-biology.component.html',
  styleUrls: ['./taxon-biology.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonBiologyComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonDescription: TaxonomyDescription[];
  @Input() context: string;

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
