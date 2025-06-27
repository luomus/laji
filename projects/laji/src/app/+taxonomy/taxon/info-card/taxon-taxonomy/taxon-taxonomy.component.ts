import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges,
Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaxonTaxonomyService } from '../../service/taxon-taxonomy.service';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

@Component({
  selector: 'laji-taxon-taxonomy',
  templateUrl: './taxon-taxonomy.component.html',
  styleUrls: ['./taxon-taxonomy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonTaxonomyComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) taxon!: Taxon;
  @Input() taxonDescription?: Taxon['descriptions'][number][];

  @Output() taxonSelect = new EventEmitter<string>();

  synonymType?: string;
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
  ] as const;

  private synonymSub?: Subscription;
  taxonChildren: Taxon[] = [];
  private childrenSub?: Subscription;

  constructor(
    private api: LajiApiClientBService,
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
        this.synonymSub = this.api.get('/taxa/{id}', {
          path: { id: this.taxon.synonymOf.id },
          query: {
            selectedFields: this.synonymTypes.join(',')
          }
        }).subscribe(taxon => {
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

  private getSynonymType(taxon: Taxon): string | undefined {
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

  taxonHasSynonymKey(taxon: Taxon) {
    for (const synonymType of this.synonymTypes) {
      if (taxon.hasOwnProperty(synonymType)) {
        return true;
      }
    }

    return false;
  }

}
