import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ResultService } from '../iucn-shared/service/result.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';

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
    private router: Router
  ) { }

  taxonSelect(taxonID: string) {
    if (taxonID) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', taxonID]));
    }
  }
}
