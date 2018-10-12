import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyApi } from '../../../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-print-taxon-header',
  templateUrl: './print-taxon-header.component.html',
  styleUrls: ['./print-taxon-header.component.css']
})
export class PrintTaxonHeaderComponent implements OnInit {
  @Input() taxonVerbatim: string;
  @Input() autocompleteTaxonId: string;
  taxon: Taxonomy;

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private taxonomyApi: TaxonomyApi
  ) { }

  ngOnInit() {
    if (this.autocompleteTaxonId) {
      this.taxonomyApi.taxonomyFindBySubject(
        this.autocompleteTaxonId,
        this.translate.currentLang,
        {selectedFields: 'scientificName,vernacularName,cursiveName'}
        ).subscribe(taxon => {
          this.taxon = taxon;
          this.cd.markForCheck();
        });
    }
  }

}
