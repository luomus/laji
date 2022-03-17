import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { IGlobalSpeciesFilters } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { SelectStyle } from '../../../../../laji/src/app/shared-modules/select/metadata-select/metadata-select.component';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { Profile } from '../../../../../laji/src/app/shared/model/Profile';
import { PersonApi } from '../../../../../laji/src/app/shared/api/PersonApi';
import { tap } from 'rxjs/operators';
import BirdwatchingActivityLevelEnum = Profile.BirdwatchingActivityLevelEnum;

@Component({
  selector: 'bsg-expertise',
  templateUrl: './expertise.component.html',
  styleUrls: ['./expertise.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpertiseComponent implements OnInit {
  speciesFilters$: Observable<IGlobalSpeciesFilters>;

  birdwatchingActivityLevel: string;

  saving = false;

  basicSelectStyle = SelectStyle.basic;

  private profile: Profile;
  private profileSub: Subscription;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private personService: PersonApi,
    private cdr: ChangeDetectorRef
  ) {
    this.speciesFilters$ = this.kerttuGlobalApi.getSpeciesFilters();
  }

  ngOnInit() {
    this.profileSub = this.personService.personFindProfileByToken(this.userService.getToken()).subscribe((profile) => {
      this.profile = profile;
      this.birdwatchingActivityLevel = profile.birdwatchingActivityLevel || '';
      this.cdr.markForCheck();
    });
  }

  save() {
    this.saving = true;
    this.saveProfile().subscribe(() =>  {
      this.saving = false;
      this.cdr.markForCheck();
    });
  }

  private saveProfile() {
    const birdwatchingActivityLevel = this.birdwatchingActivityLevel || undefined;

    this.profile.birdwatchingActivityLevel = birdwatchingActivityLevel as BirdwatchingActivityLevelEnum;

    return this.personService.personUpdateProfileByToken(this.profile, this.userService.getToken());
  }
}
