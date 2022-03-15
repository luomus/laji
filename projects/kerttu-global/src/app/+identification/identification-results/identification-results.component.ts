import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { IGlobalSite, IIdentificationSiteStat } from '../../kerttu-global-shared/models';
import { map } from 'rxjs/operators';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';

@Component({
  selector: 'bsg-identification-results',
  templateUrl: './identification-results.component.html',
  styleUrls: ['./identification-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationResultsComponent implements OnInit {
  sites$: Observable<IGlobalSite[]>;
  siteStats$: Observable<IIdentificationSiteStat[]>;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi
  ) { }

  ngOnInit(): void {
    this.sites$ = this.kerttuGlobalApi.getSites().pipe(
      map(result => result.results)
    );
    this.siteStats$ = this.kerttuGlobalApi.getIdentificationSiteStats().pipe(
      map(result => result.results)
    );
  }

}
