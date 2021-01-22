import { Component, ViewChild } from '@angular/core';
import { DEFAULT_YEAR, ResultService } from '../../service/result.service';
import { LocalizeRouterService } from '../../../../../../laji/src/app/locale/localize-router.service';
import { Router } from '@angular/router';
import { TaxonSelectComponent } from '../../../../../../laji/src/app/shared-modules/taxon-select/taxon-select.component';

@Component({
  selector: 'laji-simple-omni',
  templateUrl: './simple-omni.component.html',
  styleUrls: ['./simple-omni.component.scss']
})
export class SimpleOmniComponent {

  @ViewChild(TaxonSelectComponent, { static: true }) taxonSelectComponent: TaxonSelectComponent;

  constructor(
    private localizeRouterService: LocalizeRouterService,
    private router: Router,
    private resultService: ResultService
  ) { }

  taxonSelect(taxonID: string) {
    if (taxonID) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/results', taxonID]), {
        queryParams: {checklist: this.resultService.getChecklistVersion(DEFAULT_YEAR)}
      });
    }
    this.taxonSelectComponent.taxonId = '';
  }
}
