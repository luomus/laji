import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy } from 'projects/laji/src/app/shared/model/Taxonomy';

interface BoldEntry {
  scientificName: string;
  publicRecords: number;
  bins: string[];
}

@Component({
  selector: 'laji-taxon-bold',
  templateUrl: './taxon-bold.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonBoldComponent implements OnChanges {

  @Input() taxon: Taxonomy;

  boldEntries: BoldEntry[] = [];

  constructor(
    public translate: TranslateService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taxon) {
      this.boldEntries = [];
      this.getBoldEntries();
    }
  }

  getBoldEntries() {
    if (this.taxon.hasBold === false) {
      return;
    }

    this.getBoldEntry(this.taxon);

    if (this.taxon.synonyms) {
      this.taxon.synonyms.forEach(synonym => {
        this.getBoldEntry(synonym);
      });
    }
  }

  getBoldEntry(taxon: Taxonomy) {
    let scientificName: string = this.taxon.scientificName;
    let publicRecords = 0;
    const bins: string[] = [];

    if (taxon.scientificName) {
      scientificName = taxon.scientificName;
    }

    if (taxon.bold?.publicRecords) {
      publicRecords = taxon.bold.publicRecords;
    }

    if (taxon.bold?.binCount > 0) {
      taxon.bold?.bins.forEach(bin => {
        bins.push(bin);
      });
    }

    if (publicRecords > 0 || bins.length > 0) {
      this.boldEntries.push({
        scientificName,
        publicRecords,
        bins
      });
    }
  }
}
