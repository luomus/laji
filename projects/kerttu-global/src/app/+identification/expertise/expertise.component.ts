import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { Profile } from '../../../../../laji/src/app/shared/model/Profile';
import { PersonApi } from '../../../../../laji/src/app/shared/api/PersonApi';
import BirdwatchingActivityLevelEnum = Profile.BirdwatchingActivityLevelEnum;
import BirdSongRecognitionSkillLevel = Profile.BirdSongRecognitionSkillLevel;
import BirdSongRecognitionSkillLevelEnum = Profile.BirdSongRecognitionSkillLevelEnum;
import { AreaService } from '../../../../../laji/src/app/shared/service/area.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../../laji/src/app/shared/service/dialog.service';

@Component({
  selector: 'bsg-expertise',
  templateUrl: './expertise.component.html',
  styleUrls: ['./expertise.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpertiseComponent implements OnInit {
  continents$: Observable<{id: string; value: string}[]>;

  birdwatchingActivityLevel = '';
  birdSongRecognitionSkillLevels: BirdSongRecognitionSkillLevel[] = [];

  saving = false;

  birdwatchingActivityLevelOptions: {id: BirdwatchingActivityLevelEnum; label: string}[] = [
    {id: 'MA.birdwatchingActivityLevelEnum1', label: 'expertise.birdwatchingActivityLevel1'},
    {id: 'MA.birdwatchingActivityLevelEnum2', label: 'expertise.birdwatchingActivityLevel2'},
    {id: 'MA.birdwatchingActivityLevelEnum3', label: 'expertise.birdwatchingActivityLevel3'},
    {id: 'MA.birdwatchingActivityLevelEnum4', label: 'expertise.birdwatchingActivityLevel4'}
  ];

  private profile!: Profile;
  private profileSub!: Subscription;

  private skillLevel1: BirdSongRecognitionSkillLevelEnum = 'MA.birdSongRecognitionSkillLevelEnum1';

  constructor(
    private areaService: AreaService,
    private userService: UserService,
    private personService: PersonApi,
    private translate: TranslateService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.continents$ = this.areaService.getContinents('en');
  }

  ngOnInit() {
    this.profileSub = forkJoin([
      this.personService.personFindProfileByToken(this.userService.getToken()),
      this.continents$
    ]).subscribe(([profile, continents]) => {
      this.profile = profile;
      this.birdwatchingActivityLevel = profile.birdwatchingActivityLevel || '';
      if (profile.birdSongRecognitionSkillLevels?.length && (profile.birdSongRecognitionSkillLevels.length > 0)) {
        this.birdSongRecognitionSkillLevels = profile.birdSongRecognitionSkillLevels;
      } else {
        this.birdSongRecognitionSkillLevels = continents.map(continent => ({
          birdSongRecognitionArea: continent.id,
          birdSongRecognitionSkillLevel: this.skillLevel1
        }));
      }
      this.cdr.markForCheck();
    });
  }

  save() {
    let missingLevel = false;
    let allAreLevel1 = true;
    this.birdSongRecognitionSkillLevels.forEach(level => {
      if (!level.birdSongRecognitionSkillLevel) {
        missingLevel = true;
      } else if (level.birdSongRecognitionSkillLevel !== this.skillLevel1) {
        allAreLevel1 = false;
      }
    });

    if (missingLevel || !this.birdwatchingActivityLevel) {
      this.dialogService.alert('expertise.missingAnswer');
    } else if (allAreLevel1) {
      this.dialogService.confirm('expertise.cannotRecognizeAnyBirds').subscribe(confirm => {
        if (confirm) {
          this.saveProfile();
          this.cdr.markForCheck();
        }
      });
    } else {
      this.saveProfile();
    }
  }

  private saveProfile() {
    this.saving = true;

    this.profile.birdwatchingActivityLevel = this.birdwatchingActivityLevel as BirdwatchingActivityLevelEnum;
    this.profile.birdSongRecognitionSkillLevels = this.birdSongRecognitionSkillLevels;

    return this.personService.personUpdateProfileByToken(this.profile, this.userService.getToken()).subscribe(() => {
      this.saving = false;
      this.cdr.markForCheck();
    }, () => {
      this.dialogService.alert('expertise.error');
    });
  }
}
