import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import type { components } from 'projects/laji-api-client/generated/api';

type Taxon = components['schemas']['LajiBackendTaxon'];

@Component({
    selector: 'laji-print-taxon-header',
    templateUrl: './print-taxon-header.component.html',
    styleUrls: ['./print-taxon-header.component.css'],
    standalone: false
})
export class PrintTaxonHeaderComponent implements OnInit {
  @Input() taxonVerbatim?: string;
  @Input() autocompleteTaxonId?: string;
  taxon?: Taxon;

  constructor(
    private cd: ChangeDetectorRef,
    private api: LajiApiClientService
  ) { }

  ngOnInit() {
    if (!this.autocompleteTaxonId) {
      return;
    }
    this.api.get('/taxa/{id}', {
      path: { id: this.autocompleteTaxonId },
      query: {
        selectedFields: 'scientificName,vernacularName,cursiveName'
      }
    }, { langFallback: false }).subscribe(taxon => {
      this.taxon = taxon;
      this.cd.markForCheck();
    });
  }
}
