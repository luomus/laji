import {Component, Input, Output, OnChanges, SimpleChanges, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {Taxonomy, TaxonomyDescription} from '../../../../shared/model/Taxonomy';
import {CheckLangService} from '../../service/check-lang.service';

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

  activeDescription = 0;
  @Output() contextChange = new EventEmitter<string>();

  constructor(private checklang: CheckLangService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonDescription || changes.context) {
      this.activeDescription = 0;
      if (this.taxonDescription && this.context) {
        this.taxonDescription.forEach((description, idx) => {
          if (description.id === this.context) {
            this.activeDescription = idx;
            this.translationKo = this.checklang.checkValue(description.groups);
          }
        });
      }
    }
  }
}
