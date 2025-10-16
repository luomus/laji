import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { IGlobalSpecies, TaxonTypeEnum } from '../../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { map, share } from 'rxjs/operators';

@Component({
  selector: 'bsg-species-selection',
  template: `
    <bsg-species-selection-view
      [species]="(species$ | async) ?? undefined"
      [unknownSpeciesRecordingCount]="(unknownSpeciesRecordingCount | async) ?? undefined"
      (speciesSelect)="speciesSelect.emit($event)"
    ></bsg-species-selection-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesSelectionComponent {
  species$: Observable<IGlobalSpecies[]>;
  unknownSpeciesRecordingCount: Observable<number>;

  @Output() speciesSelect = new EventEmitter<(number|undefined)[]>();

  constructor(
    private userService: UserService,
    private kerttuGlobalApi: KerttuGlobalApi,
    private translate: TranslateService
  ) {
    const speciesData$ = this.kerttuGlobalApi.getSpeciesList(this.userService.getToken(), this.translate.currentLang, {
      page: 1,
      pageSize: 1000,
      taxonType: TaxonTypeEnum.bat,
      orderBy: ['scientificName ASC'],
      onlyWithSoundscapeRecordings: true,
      includeAnnotationStatus: true
    }).pipe(share());

    this.species$ = speciesData$.pipe(
      map(data => data.results)
    );

    this.unknownSpeciesRecordingCount = speciesData$.pipe(
      map(data => data.unknownSpeciesRecordingCount || 0)
    );
  }
}
