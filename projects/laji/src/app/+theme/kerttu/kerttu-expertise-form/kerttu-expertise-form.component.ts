import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, HostListener} from '@angular/core';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {debounceTime, map, switchMap, tap} from 'rxjs/operators';
import {UserService} from '../../../shared/service/user.service';
import {PersonApi} from '../../../shared/api/PersonApi';
import {Profile} from '../../../shared/model/Profile';
import {ComponentCanDeactivate} from '../../../shared/guards/document-de-activate.guard';
import { SelectStyle } from '../../../shared-modules/select/metadata-select/metadata-select.component';
import FinnishBirdSongRecognitionSkillLevelEnum = Profile.FinnishBirdSongRecognitionSkillLevelEnum;
import BirdwatchingActivityLevelEnum = Profile.BirdwatchingActivityLevelEnum;
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-expertise-form',
  templateUrl: './kerttu-expertise-form.component.html',
  styleUrls: ['./kerttu-expertise-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuExpertiseFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  selectedTaxonIds: string[];
  private savedSelectedTaxonIds: string[];

  finnishBirdSongRecognitionSkillLevel: string;
  birdwatchingActivityLevel: string;

  basicSelectStyle = SelectStyle.basic;

  saving = false;

  private selectedTaxonIdsSub: Subscription;
  private selectedTaxonIdsChanged: Subject<string[]> = new Subject<string[]>();
  private saveProfileSub: Subscription;

  profile: Profile;

  private debounceTime = 1000;

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private personService: PersonApi,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.selectedTaxonIdsSub = this.personService.personFindProfileByToken(this.userService.getToken()).subscribe((profile) => {
      this.profile = profile;
      this.finnishBirdSongRecognitionSkillLevel = profile.finnishBirdSongRecognitionSkillLevel || '';
      this.birdwatchingActivityLevel = profile.birdwatchingActivityLevel || '';
      this.selectedTaxonIds = profile.taxonExpertise || [];
      this.savedSelectedTaxonIds = this.selectedTaxonIds;
      this.cdr.markForCheck();
    });

    this.saveProfileSub = this.selectedTaxonIdsChanged
      .pipe(
        debounceTime(this.debounceTime),
        switchMap(() => {
          return this.updateProfile(this.selectedTaxonIds);
        })
      ).subscribe(() => {
          this.cdr.markForCheck();
        }
      );
  }

  ngOnDestroy() {
    if (this.selectedTaxonIdsSub) {
      this.selectedTaxonIdsSub.unsubscribe();
    }
    if (this.saveProfileSub) {
      this.saveProfileSub.unsubscribe();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    if (this.saving) {
      $event.returnValue = false;
    }
  }

  onSelectedTaxonIdsChange(selectedTaxonIds: string[]) {
    this.selectedTaxonIds = selectedTaxonIds;
    this.selectedTaxonIdsChanged.next(this.selectedTaxonIds);
    this.updateSaving();
  }

  onSelectChange() {
    this.selectedTaxonIdsChanged.next(this.selectedTaxonIds);
    this.updateSaving();
  }

  canDeactivate() {
    if (this.saveProfileSub) {
      this.saveProfileSub.unsubscribe();
    }
    return this.updateProfile(this.selectedTaxonIds)
      .pipe(map(() => true));
  }

  private updateProfile(selectedTaxonIds): Observable<Profile> {
    const finnishBirdSongRecognitionSkillLevel = this.finnishBirdSongRecognitionSkillLevel || undefined;
    const birdwatchingActivityLevel = this.birdwatchingActivityLevel || undefined;

    if (
      this.savedSelectedTaxonIds === selectedTaxonIds &&
      this.profile.finnishBirdSongRecognitionSkillLevel === finnishBirdSongRecognitionSkillLevel &&
      this.profile.birdwatchingActivityLevel === birdwatchingActivityLevel) {
      return of (this.profile);
    }

    this.profile.taxonExpertise = selectedTaxonIds;
    this.profile.finnishBirdSongRecognitionSkillLevel = finnishBirdSongRecognitionSkillLevel as FinnishBirdSongRecognitionSkillLevelEnum;
    this.profile.birdwatchingActivityLevel = birdwatchingActivityLevel as BirdwatchingActivityLevelEnum;

    return this.personService.personUpdateProfileByToken(this.profile, this.userService.getToken()).pipe(
      tap(() => {
        this.savedSelectedTaxonIds = selectedTaxonIds;
        this.updateSaving();
      })
    );
  }

  private updateSaving() {
    const allSaved = this.savedSelectedTaxonIds === this.selectedTaxonIds
      && (this.profile.finnishBirdSongRecognitionSkillLevel === (this.finnishBirdSongRecognitionSkillLevel || undefined))
      && (this.profile.birdwatchingActivityLevel === (this.birdwatchingActivityLevel || undefined));

    this.saving = !allSaved;
  }
}
