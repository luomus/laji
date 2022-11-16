import { ChangeDetectionStrategy, Component, Input, OnInit, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

interface BoldEntry {
  scientificName: string;
  publicRecords: number;
  bins: string[];
}

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInfoComponent implements OnInit, OnDestroy, OnChanges {

  @Input() taxon: Taxonomy;

  langs = ['fi', 'sv', 'en', 'se', 'ru'];
  availableVernacularNames = [];
  availableTaxonNames = {vernacularNames: [], colloquialVernacularNames: []};
  boldEntries: BoldEntry[] = [];

  constructor(
    public translate: TranslateService
    ) { }

  ngOnInit() {
      this.initLangTaxonNames();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taxon) {
      this.getBoldEntries();
    }
  }

  ngOnDestroy() {
  }

  initLangTaxonNames() {
   this.langs.forEach(value => {
    if (this.taxon.vernacularName?.hasOwnProperty(value) && this.taxon.vernacularName[value] !== '') {
      this.availableVernacularNames.push({lang: value});
      this.availableTaxonNames.vernacularNames.push({lang: value});
    }
    if (this.taxon.colloquialVernacularName?.hasOwnProperty(value) && this.taxon.colloquialVernacularName[value] !== '') {
      this.availableTaxonNames.colloquialVernacularNames.push({lang: value});
    }
   });
  }

  getBoldEntries() {
    if (this.taxon.hasBold === false) {
      this.boldEntries = [];
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
