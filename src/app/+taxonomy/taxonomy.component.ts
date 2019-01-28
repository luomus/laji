import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../locale/localize-router.service';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxonomy.component.html',
  styleUrls: ['./taxonomy.component.css']
})
export class TaxonomyComponent {
  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) { }

  toTaxonPage(taxonId: string) {
    if (taxonId) {
      this.router.navigate(
        this.localizeRouterService.translateRoute(['/taxon', taxonId])
      );
    }
  }
}
