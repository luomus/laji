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
  groupHasTranslation: any[];
  ylestaHasTranslation: any[];

  hasAuthorData: boolean;
  activeDescription = 0;
  @Output() contextChange = new EventEmitter<string>();

  constructor(private checklang: CheckLangService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.ylesta = [{'text': undefined, 'visible': undefined}];
    this.ylestaTitle = undefined;
    this.groupHasTranslation = [];
    this.ylestaHasTranslation = [];
    if (changes.taxonDescription || changes.context) {
      this.activeDescription = 0;
      if (this.taxonDescription && this.context) {
        this.groupHasTranslation = this.checklang.checkValue(this.taxonDescription);
        this.taxonDescription.forEach((description, idx) => {
          if (description.id === this.context) {
            this.activeDescription = idx;
          }

          (description.groups || []).forEach(gruppo => {
            if (gruppo.group === 'MX.SDVG8') {
              this.ylestaTitle = gruppo.title;
              this.ylesta[0].text = gruppo.variables;

              this.ylestaHasTranslation = this.groupHasTranslation[idx].groups.filter(el =>
                el.id === 'MX.SDVG8'
              );
              this.ylesta[0].visible = this.ylestaHasTranslation.length > 0 ? this.ylestaHasTranslation[0].values : [];
            }
          });
        });
      }
    }
  }
}
