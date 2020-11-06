import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';
import { CheckLangService } from '../../service/check-lang.service';
import { TranslateService } from '@ngx-translate/core';

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
  ylestaHasTranslation: any;

  hasAuthorData = true;
  activeDescription = 0;
  activeDescriptionContent: any;
  currentLang: string;
  @Output() contextChange = new EventEmitter<string>();

  constructor(private checklang: CheckLangService, private translation: TranslateService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.ylesta = [{'text': undefined, 'visible': undefined}];
    this.ylestaTitle = undefined;
    this.groupHasTranslation = [];
    this.ylestaHasTranslation = [];
    this.activeDescriptionContent = {};
    this.currentLang = this.translation.currentLang;
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
