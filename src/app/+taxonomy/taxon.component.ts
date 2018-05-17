import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../locale/localize-router.service';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.css']
})
export class TaxonComponent {
  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) { }

  goToBrowsePage(groupId: string) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/taxon/list']),
      {queryParams: {
        informalTaxonGroupId: groupId,
        onlyFinnish: true
      }}
    );
  }
}
