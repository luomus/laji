import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DEFAULT_YEAR, ResultService } from '../iucn-shared/service/result.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../../src/app/locale/localize-router.service';

@Component({
  selector: 'laji-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  constructor(
    public iucnService: ResultService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router,
    private resultService: ResultService
  ) { }

  taxonSelect(taxonID: string) {
    if (taxonID) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', taxonID]), {
        queryParams: {checklist: this.resultService.getChecklistVersion(DEFAULT_YEAR)}
      });
    }
  }
}
