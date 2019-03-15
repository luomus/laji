import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {Taxonomy, TaxonomyDescription, TaxonomyDescriptionGroup} from '../../../../shared/model/Taxonomy';
import {Subscription} from 'rxjs';
import {TaxonomyApi} from '../../../../shared/api/TaxonomyApi';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-taxon-taxonomy',
  templateUrl: './taxon-taxonomy.component.html',
  styleUrls: ['./taxon-taxonomy.component.scss']
})
export class TaxonTaxonomyComponent implements OnChanges, OnDestroy {
  @Input() taxon: Taxonomy;

  taxonomyDescriptions: TaxonomyDescriptionGroup;
  _taxonDescription: TaxonomyDescription;

  synonymType: string;
  synonymTypes = [
    'basionyms',
    'objectiveSynonyms',
    'subjectiveSynonyms',
    'homotypicSynonyms',
    'heterotypicSynonyms',
    'synonyms',
    'misspelledNames',
    'orthographicVariants',
    'uncertainSynonyms',
    'misappliedNames',
    'alternativeNames'
  ];

  private synonymSub: Subscription;

  constructor(
    private translate: TranslateService,
    private taxonService: TaxonomyApi,
    private cd: ChangeDetectorRef
  ) { }

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.taxonomyDescriptions = undefined;
    this._taxonDescription = taxonDescription && taxonDescription.length > 0 ? taxonDescription[0] : undefined;

    if (this._taxonDescription) {
      (this._taxonDescription.groups || []).forEach(group => {
        if (group.group === 'MX.SDVG14') {
          this.taxonomyDescriptions = group;
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      if (this.synonymSub) {
        this.synonymSub.unsubscribe();
      }
      this.synonymType = undefined;

      if (!this.taxon.nameAccordingTo) {
        this.synonymSub = this.taxonService.taxonomyFindBySubject(
          this.taxon.synonymOf.id,
          this.translate.currentLang,
          {
            selectedFields: this.synonymTypes.join(',')
          }
        )
          .subscribe(taxon => {
            this.synonymType = this.getSynonymType(taxon);
            this.cd.markForCheck();
          });
      }
    }
  }

  ngOnDestroy() {
    if (this.synonymSub) {
      this.synonymSub.unsubscribe();
    }
  }

  private getSynonymType(taxon: Taxonomy): string {
    for (const synonymType of this.synonymTypes) {
      if (taxon[synonymType]) {
        for (const synonym of taxon[synonymType]) {
          if (synonym.id === this.taxon.id) {
            return synonymType;
          }
        }
      }
    }
  }
}
