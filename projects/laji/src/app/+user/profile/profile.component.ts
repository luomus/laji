import { catchError, concatMap, map, take } from 'rxjs/operators';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { prepareProfile, UserService } from '../../shared/service/user.service';
import { PersonApi } from '../../shared/api/PersonApi';
import { Profile } from '../../shared/model/Profile';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin as ObservableForkJoin, of as ObservableOf, Subscription } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { Person } from '../../shared/model/Person';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'laji-user',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {

  currentProfile!: Profile;
  userProfile!: Profile;

  public isCurrentUser = false;
  public userId = '';
  public isCreate = true;
  public editing = false;
  public loading = true;
  public personSelfUrl = '/';

  private subProfile!: Subscription;
  intellectualRightsArray: Profile.IntellectualRights[] = [
    Profile.IntellectualRights.intellectualRightsCCBYSA4,
    Profile.IntellectualRights.intellectualRightsCCBYNC4,
    Profile.IntellectualRights.intellectualRightsCCBYNCSA4,
    Profile.IntellectualRights.intellectualRightsCCBY4,
    Profile.IntellectualRights.intellectualRightsCC04,
    Profile.IntellectualRights.intellectualRightsARR
  ];

  intellectualRights = Profile.IntellectualRights;

  constructor(private userService: UserService,
              private personService: PersonApi,
              private localizeRouterService: LocalizeRouterService,
              private route: ActivatedRoute,
              private router: Router,
              private logger: Logger,
              private cdr: ChangeDetectorRef
  ) {
    this.personSelfUrl = environment.selfPage;
  }

  ngOnInit() {
    this.loading = true;
    this.subProfile = this.route.params.pipe(
      map(params => params['userId']),
      concatMap(id => this.userService.user$.pipe(
        take(1),
        map(user => ({id, currentUser: user}))
      )),
      concatMap(({currentUser, id}) => {
        const empty$ = ObservableOf({} as Profile);
        const null$ = ObservableOf(null);
        const userProfile$ = this.personService.personFindProfileByToken(this.userService.getToken()).pipe(catchError(() => null$));
        return ObservableForkJoin(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          currentUser!.id
            ? userProfile$
            : empty$,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          currentUser!.id === id
            ? userProfile$
            : this.personService.personFindProfileByUserId(id).pipe(catchError(() => empty$))
        ).pipe(
          map(([userProfile, currentProfile]) => ({
            id,
            currentUser,
            userProfile,
            currentProfile
          }))
        );
      })
    ).subscribe(
      ({id, currentUser, userProfile, currentProfile}) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.isCurrentUser = id === currentUser!.id;
          this.userId = id;
          this.isCreate = !userProfile;
          this.currentProfile = prepareProfile(currentProfile, currentUser);
          this.userProfile = prepareProfile(userProfile, currentUser);
          this.loading = false;
          this.editing = false;
          this.cdr.detectChanges();
        },
        err => {
          this.logger.warn('Failed to init currentProfile', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      );
  }

  ngOnDestroy() {
    if (this.subProfile) {
      this.subProfile.unsubscribe();
    }
  }

  getCurrentUser() {
    return this.userService.user$.pipe(take(1));
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  saveProfile() {
    this.loading = true;
    const method = this.isCreate ? 'personCreateProfileByToken' : 'personUpdateProfileByToken';
    this.personService[method](this.getSaveProfile(), this.userService.getToken())
      .subscribe(
        profile => {
          this.isCreate = false;
          this.currentProfile = profile;
          this.userProfile = profile;
          this.editing = false;
          this.loading = false;
        },
        err => this.logger.warn('Failed to save profile', err)
      );
  }

  selectPerson(person: Person) {
    if (!person.id) {
      return;
    }
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/user', person.id])
    );
  }

  private getSaveProfile(): Profile {
    return {
      ...this.userProfile,
      image: this.currentProfile.image,
      profileDescription: this.currentProfile.profileDescription,
      personalCollectionIdentifier: this.currentProfile.personalCollectionIdentifier,
      settings: {
        ...this.userProfile.settings,
        defaultMediaMetadata: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ...this.userProfile.settings!.defaultMediaMetadata,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          capturerVerbatim: this.currentProfile?.settings?.defaultMediaMetadata?.capturerVerbatim!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          intellectualOwner: this.currentProfile?.settings?.defaultMediaMetadata?.intellectualOwner!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          intellectualRights: this.currentProfile?.settings?.defaultMediaMetadata?.intellectualRights!
        }
      }
    };
  }
}
