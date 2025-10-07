import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable } from 'rxjs';
import {
  IGlobalSite,
  IIdentificationSiteStat,
  IIdentificationStat,
  IIdentificationUserStatResult,
  IIdentificationSpeciesStat, TaxonTypeEnum
} from '../../../kerttu-global-shared/models';
import { map, share, shareReplay, switchMap } from 'rxjs/operators';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { toHtmlInputElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bsg-identification-results',
  templateUrl: './identification-results.component.html',
  styleUrls: ['./identification-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationResultsComponent implements OnInit {
  @Input() taxonTypes: TaxonTypeEnum[]|null = null;
  @Input() showMap = true;

  sites$!: Observable<IGlobalSite[]>;
  siteStats$!: Observable<IIdentificationSiteStat[]>;
  userStats$!: Observable<IIdentificationUserStatResult>;
  speciesStats$!: Observable<IIdentificationSpeciesStat[]>;
  ownSpeciesStats$!: Observable<IIdentificationSpeciesStat[]>;
  generalStats$!: Observable<IIdentificationStat>;

  showOwnSpecies = false;
  filterSpeciesBy = '';

  toHtmlInputElement = toHtmlInputElement;

  constructor(
    private userService: UserService,
    private kerttuGlobalApi: KerttuGlobalApi,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.sites$ = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.kerttuGlobalApi.getSites(this.taxonTypes, this.userService.getToken())),
      map(result => result.results)
    );
    this.siteStats$ = this.kerttuGlobalApi.getIdentificationSiteStats(this.taxonTypes).pipe(
      map(result => result.results)
    );
    this.userStats$ = this.kerttuGlobalApi.getIdentificationUserStats(this.taxonTypes).pipe(
      share()
    );
    this.speciesStats$ = this.kerttuGlobalApi.getIdentificationSpeciesStats(this.taxonTypes, this.translate.currentLang).pipe(
      map(result => result.results),
      shareReplay(1)
    );
    this.ownSpeciesStats$ = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.kerttuGlobalApi.getIdentificationOwnSpeciesStats(this.taxonTypes, this.userService.getToken(), this.translate.currentLang)),
      map(result => result.results),
      shareReplay(1)
    );
    this.generalStats$ = this.userStats$.pipe(map(stats => this.generalStatsFromUserStats(stats)));
  }

  filterSpeciesByChange(value?: string) {
    this.filterSpeciesBy = value || '';
  }

  private generalStatsFromUserStats(data: IIdentificationUserStatResult): IIdentificationStat {
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
