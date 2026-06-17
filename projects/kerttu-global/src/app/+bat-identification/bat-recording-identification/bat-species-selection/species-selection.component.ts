import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject, map, Observable, share, switchMap, startWith } from 'rxjs';
import { Site, Species, TaxonTypeEnum } from '../../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'bsg-species-selection',
    template: `
    <bsg-species-selection-view
      [sites]="(sites$ | async) ?? undefined"
      [species]="(species$ | async) ?? undefined"
      [unknownSpeciesRecordingCount]="(unknownSpeciesRecordingCount | async) ?? undefined"
      (siteChange)="onSiteChange($event)"
      (speciesSelect)="speciesSelect.emit($event)"
    ></bsg-species-selection-view>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SpeciesSelectionComponent {
  sites$: Observable<Site[]>;
  species$: Observable<Species[] | undefined>;
  unknownSpeciesRecordingCount: Observable<number | undefined>;
  site$ = new BehaviorSubject<number | undefined>(undefined);

  @Output() speciesSelect = new EventEmitter<(number|undefined)[]>();
  @Output() siteChange = new EventEmitter<number | undefined>();

  constructor(
    private userService: UserService,
    private kerttuGlobalApi: KerttuGlobalApi,
    private translate: TranslateService
  ) {
    this.sites$ = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.kerttuGlobalApi.getSites(
        [TaxonTypeEnum.bat],
        this.userService.getToken())
      ),
      map(result => result.results)
    );

    const speciesData$ = this.site$.pipe(
      switchMap(site => this.kerttuGlobalApi.getSpeciesList(this.userService.getToken(), this.translate.getCurrentLang(), {
        page: 1,
        pageSize: 1000,
        taxonTypes: [TaxonTypeEnum.bat],
        orderBy: ['scientificName ASC'],
        onlyWithSoundscapeRecordings: true,
        soundscapeSites: site ? [site] : undefined,
        includeAnnotationStatus: true,
      }).pipe(startWith(undefined))),
      share()
    );

    this.species$ = speciesData$.pipe(
      map(data => data?.results)
    );

    this.unknownSpeciesRecordingCount = speciesData$.pipe(
      map(data => data?.unknownSpeciesRecordingCount ?? undefined)
    );
  }

  onSiteChange(siteId: number|undefined) {
    this.site$.next(siteId);
    this.siteChange.emit(siteId);
  }
}
