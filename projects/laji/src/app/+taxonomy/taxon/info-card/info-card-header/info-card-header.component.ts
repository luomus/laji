import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TaxonTaxonomyService } from '../../service/taxon-taxonomy.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { MultiLanguage } from 'projects/laji/src/app/shared/model/MultiLanguage';

type Taxon = components['schemas']['LajiBackendTaxon'];

@Component({
    selector: 'laji-info-card-header',
    templateUrl: './info-card-header.component.html',
    styleUrls: ['./info-card-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InfoCardHeaderComponent implements OnChanges {
  @Input() taxon!: Taxon;
  @Input() activeTab!: string;

  parent: Taxon[] | undefined;
  siblings: Taxon[] | undefined;
  taxonNames!: Omit<Taxon, 'vernacularName' | 'colloquialVernacularName' | 'alternativeVernacularName' | 'obsoleteVernacularName' | 'tradeName'>
    & {
      vernacularName: MultiLanguage;
      colloquialVernacularName: MultiLanguage<string[]>;
      alternativeVernacularName: MultiLanguage<string[]>;
      obsoleteVernacularName: MultiLanguage<string[]>;
      tradeName: MultiLanguage<string[]>;
    };

  loadingParent = false;
  subParam: any;

  private parentSub: Subscription | undefined;
  private siblingSub: Subscription | undefined;

  @Output() taxonSelect = new EventEmitter<string>();

  constructor(
    private taxonomyService: TaxonTaxonomyService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.setParent(changes.taxon.currentValue as unknown as Taxon);
      this.setSiblings(changes.taxon.currentValue as unknown as Taxon);
      this.setTaxonNames(changes.taxon.currentValue as unknown as Taxon);
    }
  }

  selectRightSibling() {
    let idx = 0;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (let i = 0; i < this.siblings!.length - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.siblings![i].id === this.taxon.id) {
        idx = i + 1;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.taxonSelect.emit(this.siblings![idx].id);
  }

  selectLeftSibling() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let idx = this.siblings!.length - 1;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (let i = 1; i < this.siblings!.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.siblings![i].id === this.taxon.id) {
        idx = i - 1;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.taxonSelect.emit(this.siblings![idx].id);
  }

  setTaxonNames(taxon: Taxon) {
    this.taxonNames = {
      ...taxon,
      vernacularName: taxon.vernacularNameMultiLang,
      colloquialVernacularName: taxon.colloquialVernacularNameMultiLang,
      alternativeVernacularName: taxon.alternativeVernacularNameMultiLang,
      obsoleteVernacularName: taxon.obsoleteVernacularNameMultiLang,
      tradeName: taxon.tradeNameMultiLang,
    };
  }


  private setParent(taxon: Taxon) {
    if (this.parentSub) {
      this.parentSub.unsubscribe();
    }

    if (taxon.hasParent) {
      this.loadingParent = true;
      this.parentSub = this.taxonomyService.getParents(taxon.id)
        .subscribe(parent => {
          this.parent = parent;
          this.loadingParent = false;
          this.cd.markForCheck();
        });
    } else {
      this.loadingParent = false;
    }
  }

  private setSiblings(taxon: Taxon) {
    if (this.siblingSub) {
      this.siblingSub.unsubscribe();
    }

    if (taxon.hasParent || taxon.hasChildren) {
      this.siblingSub = this.taxonomyService.getSiblings(taxon.id)
        .subscribe(siblings => {
          this.siblings = siblings;
          this.cd.markForCheck();
        });
    }
  }
}
