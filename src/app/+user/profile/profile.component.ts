import { catchError, concatMap, map, take, tap } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { PersonApi } from '../../shared/api/PersonApi';
import { Profile } from '../../shared/model/Profile';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin as ObservableForkJoin, of as ObservableOf, Subscription } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { Person } from '../../shared/model/Person';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { UsersPipe } from '../../shared/pipe/users.pipe';


@Component({
  selector: 'laji-user',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [ UsersPipe ]
})
export class ProfileComponent implements OnInit, OnDestroy {

  profile: Profile = {
    image: '',
    profileDescription: '',
    personalCollectionIdentifier: '',
    friendRequests: [],
    friends: [],
    blocked: [],
    settings: {
      capturerVerbatim: '',
      intellectualOwner: '',
      intellectualRights: undefined,
    }
  };

  personsProfile: Profile = {};

  public isCurrentUser = false;
  public userId = '';
  public userFullName = '';
  public isCreate = true;
  public editing = false;
  public loading = true;
  public personSelfUrl = '/';

  private subProfile: Subscription;
  intellectualRightsArray: any[] = [];

  intellectualRights = Profile.IntellectualRightsEnum;


  constructor(private userService: UserService,
              private personService: PersonApi,
              private localizeRouterService: LocalizeRouterService,
              private route: ActivatedRoute,
              private router: Router,
              private logger: Logger,
              private userPipe: UsersPipe
  ) {
    this.personSelfUrl = environment.selfPage;
  }

  ngOnInit() {
    this.subProfile = this.route.params.pipe(
      tap(() => this.loading = true),
      map(params => params['userId']),
      concatMap((id) => this.userService.user$.pipe(
        take(1),
        map(user => ({id: id, currentUser: user}))
      )),
      concatMap(data => {
        const currentActive = data.currentUser.id === data.id;
        const empty$ = ObservableOf({});
        const false$ = ObservableOf(false);
        return ObservableForkJoin(
          data.currentUser.id ?
            this.personService.personFindProfileByToken(this.userService.getToken()).pipe(catchError((e) => false$)) :
            empty$,
          currentActive ?
            false$ :
            this.personService.personFindProfileByUserId(data.id).pipe(catchError((e) => empty$))
        ).pipe(
          map(profiles => ({
            id: data.id,
            currentUser: data.currentUser,
            currentProfile: profiles[0],
            profile: profiles[1] || profiles[0]
          }))
        );
      })
    )
      .subscribe(
        data => {
          this.isCurrentUser = data.id === data.currentUser.id;
          this.userId = data.id;
          this.userFullName = data.currentUser.fullName;
          this.isCreate = !data.currentProfile;
          this.profile = data.profile || {};
          if (!this.profile.settings) {
            this.profile.settings = {
              capturerVerbatim: '',
              intellectualOwner: '',
              intellectualRights: undefined,
            }
          }
          this.profile.settings['capturerVerbatim'] = this.profile.settings && (this.profile.settings['capturerVerbatim'] || this.profile.settings['capturerVerbatim'] !== '') ? this.profile.settings['capturerVerbatim']  : this.userFullName;
          this.profile.settings['intellectualOwner'] = this.profile.settings && (this.profile.settings['intellectualOwner'] || this.profile.settings['intellectualOwner'] !== '') ? this.profile.settings.intellectualOwner : this.userFullName;
          this.profile.settings['intellectualRights'] = this.profile.settings && (this.profile.settings['intellectualRights'] || this.profile.settings['intellectualRights'] !== undefined) ?
          this.profile.settings['intellectualRights'] : Profile.IntellectualRightsEnum.IntellectualRightsCCBY;
          this.personsProfile = data.currentProfile || {};
          this.loading = false;
          this.editing = false;
        },
        err => this.logger.warn('Failed to init profile', err)
      );

      const values = Object.values(this.intellectualRights);
      const keys = Object.keys(this.intellectualRights);
      for (let i = 0; i < Object.values(this.intellectualRights).length; i++) {
        this.intellectualRightsArray.push({'key': keys[i], 'value': values[i]});
      }
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
    this.personService[method](this.getProfile(), this.userService.getToken())
      .subscribe(
        profile => {
          this.isCreate = false;
          this.profile = profile;
          this.personsProfile = profile;
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

  private getProfile(): Profile {
    return {
      ...this.personsProfile,
      image: this.profile.image,
      profileDescription: this.profile.profileDescription,
      personalCollectionIdentifier: this.profile.personalCollectionIdentifier,
      capturerVerbatim: this.profile.capturerVerbatim,
      intellectualOwner: this.profile.intellectualOwner,
      intellectualRights: this.profile.intellectualRights,
      settings: {
        capturerVerbatim: this.profile.settings['capturerVerbatim'] !== '' ? this.profile.settings['capturerVerbatim'] : this.userFullName,
        intellectualOwner: this.profile.settings['intellectualOwner'] !== '' ? this.profile.settings['intellectualOwner']: this.userFullName,
        intellectualRights: this.profile.settings['intellectualRights'],
      }
    };
  }
}
