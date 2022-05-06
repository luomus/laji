import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { IGlobalSite, IIdentificationSiteStat, IIdentificationStat, IIdentificationUserStat } from '../../kerttu-global-shared/models';
import { map, share } from 'rxjs/operators';
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
  userStats$: Observable<IIdentificationUserStat[]>;
  generalStats$: Observable<IIdentificationStat>;
  userId$: Observable<string>;

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
    this.userStats$ = this.kerttuGlobalApi.getIdentificationUserStats().pipe(
      map(result => result.results),
      share()
    );
    this.generalStats$ = this.userStats$.pipe(map(stats => this.generalStatsFromUserStats(stats)));
  }

  private generalStatsFromUserStats(userList: IIdentificationUserStat[]): IIdentificationStat {
    let annotationCount = 0;
    let speciesCount = 0;
    let drawnBoxesCount = 0;

    userList.forEach(userStat => {
      annotationCount += userStat.annotationCount;
      speciesCount += userStat.speciesCount;
      drawnBoxesCount += userStat.drawnBoxesCount;
    });

    return {
      annotationCount,
      speciesCount,
      drawnBoxesCount
    };
  }
}
