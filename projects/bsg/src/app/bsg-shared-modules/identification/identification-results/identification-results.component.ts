import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Site,
  SiteStatistics,
  IdentificationCountStatistics,
  IdentificationUserStatisticsData,
  IdentificationSpeciesStatistics, TaxonTypeEnum
} from '../../../bsg-shared/models';
import { map, share, shareReplay, switchMap } from 'rxjs';
import { BsgApi } from '../../../bsg-shared/service/bsg-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { toHtmlInputElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'bsg-identification-results',
    templateUrl: './identification-results.component.html',
    styleUrls: ['./identification-results.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IdentificationResultsComponent implements OnInit {
  @Input() taxonTypes: TaxonTypeEnum[]|null = null;
  @Input() showMap = true;

  sites$!: Observable<Site[]>;
  siteStats$!: Observable<SiteStatistics[]>;
  userStats$!: Observable<IdentificationUserStatisticsData>;
  speciesStats$!: Observable<IdentificationSpeciesStatistics[]>;
  ownSpeciesStats$!: Observable<IdentificationSpeciesStatistics[]>;
  generalStats$!: Observable<IdentificationCountStatistics>;

  showOwnSpecies = false;
  filterSpeciesBy = '';

  toHtmlInputElement = toHtmlInputElement;

  constructor(
    private userService: UserService,
    private bsgApi: BsgApi,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.sites$ = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.bsgApi.getSites(this.taxonTypes, this.userService.getToken())),
      map(result => result.results)
    );
    this.siteStats$ = this.bsgApi.getIdentificationSiteStatistics(this.taxonTypes).pipe(
      map(result => result.results)
    );
    this.userStats$ = this.bsgApi.getIdentificationUserStatistics(this.taxonTypes).pipe(
      share()
    );
    this.speciesStats$ = this.bsgApi.getIdentificationSpeciesStatistics(this.taxonTypes, this.translate.getCurrentLang()).pipe(
      map(result => result.results),
      shareReplay(1)
    );
    this.ownSpeciesStats$ = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.bsgApi.getIdentificationOwnSpeciesStatistics(this.taxonTypes, this.userService.getToken(), this.translate.getCurrentLang())),
      map(result => result.results),
      shareReplay(1)
    );
    this.generalStats$ = this.userStats$.pipe(map(stats => this.generalStatsFromUserStats(stats)));
  }

  filterSpeciesByChange(value?: string) {
    this.filterSpeciesBy = value || '';
  }

  private generalStatsFromUserStats(data: IdentificationUserStatisticsData): IdentificationCountStatistics {
    let annotationCount = 0;
    let speciesCount = 0;
    let drawnBoxesCount = 0;

    data.results.forEach(userStat => {
      annotationCount += userStat.annotationCount;
      speciesCount += userStat.speciesCount;
      drawnBoxesCount += userStat.drawnBoxesCount;
    });

    return {
      annotationCount,
      speciesCount,
      distinctSpeciesCount: data.totalDistinctSpeciesCount,
      drawnBoxesCount
    };
  }
}
