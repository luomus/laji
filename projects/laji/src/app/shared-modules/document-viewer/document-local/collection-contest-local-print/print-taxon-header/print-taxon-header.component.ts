import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import type { components } from 'projects/laji-api-client-b/generated/api';

type Taxon = components['schemas']['Taxon'];

@Component({
  selector: 'laji-print-taxon-header',
  templateUrl: './print-taxon-header.component.html',
  styleUrls: ['./print-taxon-header.component.css']
})
export class PrintTaxonHeaderComponent implements OnInit {
  @Input() taxonVerbatim?: string;
  @Input() autocompleteTaxonId?: string;
  taxon?: Taxon;

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private api: LajiApiClientBService
  ) { }

  ngOnInit() {
    if (!this.autocompleteTaxonId) {
      return;
    }
    this.api.get('/taxa/{id}', {
      path: { id: this.autocompleteTaxonId },
      query: {
        selectedFields: 'scientificName,vernacularName,cursiveName',
        lang: this.translate.currentLang as any
      }
    }).subscribe(taxon => {
      this.taxon = taxon;
      this.cd.markForCheck();
    });
  }
}
