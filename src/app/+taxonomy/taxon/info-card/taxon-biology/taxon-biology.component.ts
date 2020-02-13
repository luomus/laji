import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';
import { CheckLangService } from '../../service/check-lang.service';

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
  translationKo: any;
  ylesta: any;
  ylestaTitle: any;

  activeDescription = 0;
  @Output() contextChange = new EventEmitter<string>();

  constructor(private checklang: CheckLangService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.ylesta = undefined;
    this.ylestaTitle = undefined;
    if (changes.taxonDescription || changes.context) {
      this.activeDescription = 0;
      if (this.taxonDescription && this.context) {
        this.taxonDescription.forEach((description, idx) => {
          if (description.id === this.context) {
            this.activeDescription = idx;
            (description.groups || []).forEach(gruppo => {
              if (gruppo.group === 'MX.SDVG8') {
                this.ylestaTitle = gruppo.title;
                this.ylesta = gruppo.variables;
              }
            });
          }
        });
      }
    }
  }
}
