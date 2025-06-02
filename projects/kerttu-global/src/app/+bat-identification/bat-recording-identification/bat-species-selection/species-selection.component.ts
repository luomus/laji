import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { IGlobalSpecies, TaxonTypeEnum } from '../../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bsg-species-selection',
  template: `
    <bsg-species-selection-view
      [species]="(species$ | async) ?? undefined"
      (speciesSelect)="speciesSelect.emit($event)"
    ></bsg-species-selection-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesSelectionComponent {
  species$: Observable<IGlobalSpecies[]>;

  @Output() speciesSelect = new EventEmitter<number[]>();

  constructor(
    private userService: UserService,
    private kerttuGlobalApi: KerttuGlobalApi,
    private translate: TranslateService
  ) {
    this.species$ = this.kerttuGlobalApi.getSpeciesList(this.userService.getToken(), this.translate.currentLang, {
      page: 1,
      pageSize: 1000,
      taxonType: TaxonTypeEnum.bat,
      orderBy: ['scientificName ASC'],
      onlyWithSoundscapeRecordings: true,
      includeAnnotationStatus: true
    }).pipe(map(speciesList => speciesList.results));
  }
}
