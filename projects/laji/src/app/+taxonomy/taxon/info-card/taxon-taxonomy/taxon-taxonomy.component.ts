import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges,
Output, EventEmitter } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaxonomyApi } from '../../../../shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';
import { TaxonTaxonomyService } from '../../service/taxon-taxonomy.service';

@Component({
  selector: 'laji-taxon-taxonomy',
  templateUrl: './taxon-taxonomy.component.html',
  styleUrls: ['./taxon-taxonomy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonTaxonomyComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) taxon!: Taxonomy;
  @Input() taxonDescription?: TaxonomyDescription[];

  @Output() taxonSelect = new EventEmitter<string>();

  synonymType?: string;
  synonymTypes: (keyof Taxonomy)[] = [
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

  private synonymSub?: Subscription;
  taxonChildren: Taxonomy[] = [];
  private childrenSub?: Subscription;

  constructor(
    private translate: TranslateService,
    private taxonService: TaxonomyApi,
    private taxonomyService: TaxonTaxonomyService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.getChildren();
    if (changes.taxon) {
      if (this.synonymSub) {
        this.synonymSub.unsubscribe();
      }
      this.synonymType = undefined;

      if (!this.taxon.nameAccordingTo && this.taxon.synonymOf) {
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

    if (this.childrenSub) {
      this.childrenSub.unsubscribe();
    }
  }

  private getSynonymType(taxon: Taxonomy): string | undefined {
    for (const synonymType of this.synonymTypes) {
      if (taxon[synonymType]) {
        for (const synonym of taxon[synonymType]) {
          if (synonym.id === this.taxon.id) {
            return synonymType;
          }
        }
      }
    }
    return undefined;
  }

  private getChildren() {
    if (this.childrenSub) {
      this.childrenSub.unsubscribe();
    }
    this.childrenSub = this.taxonomyService
      .getChildren(this.taxon.id).pipe(
        map((obj) => {
          obj.forEach(r => {
            if (!r['observationCountFinland']) {
              r['observationCountFinland'] = 0;
            }
          });
          return obj;
       })
      )
      .subscribe(data => {
        this.taxonChildren = data;
        this.cd.markForCheck();
      });
  }

  taxonHasSynonymKey(taxon: Taxonomy) {
    for (const synonymType of this.synonymTypes) {
      if (taxon.hasOwnProperty(synonymType)) {
        return true;
      }
    }

    return false;
  }

}
