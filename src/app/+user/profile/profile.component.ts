import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { PersonApi } from '../../shared/api/PersonApi';
import { Profile } from '../../shared/model/Profile';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../../shared/logger/logger.service';
import { environment } from '../../../environments/environment';
import { Person } from '../../shared/model';
import { LocalizeRouterService } from '../../locale/localize-router.service';

@Component({
  selector: 'laji-user',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  profile: Profile = {
    image: '',
    profileDescription: '',
    friendRequests: [],
    friends: [],
    blocked: []
  };

  personsProfile: Profile = {};

  public isCurrentUser = false;
  public userId = '';
  public isCreate = true;
  public editing = false;
  public loading = true;
  public personSelfUrl = '/';

  private subProfile: Subscription;

  constructor(private userService: UserService,
              private personService: PersonApi,
              private localizeRouterService: LocalizeRouterService,
              private route: ActivatedRoute,
              private router: Router,
              private logger: Logger
  ) {
    this.personSelfUrl = environment.selfPage;
  }

  ngOnInit() {
    this.subProfile = this.route.params
      .do((_) => this.loading = true)
      .map(params => params['userId'])
      .combineLatest(this.userService.getUser(), (id, user) => ({id: id, currentUser: user}))
      .flatMap((data) => {
          const currentActive = data.currentUser.id === data.id;
          const empty$ = Observable.of({});
          const false$ = Observable.of(false);
          return Observable.forkJoin(
            data.currentUser.id ? this.personService.personFindProfileByToken(this.userService.getToken()).catch((e) => false$) : empty$,
            currentActive ? false$ : this.personService.personFindProfileByUserId(data.id).catch((e) => empty$)
          );
        },
        (data, profiles) => ({
          id: data.id,
          currentUser: data.currentUser,
          currentProfile: profiles[0],
          profile: profiles[1] || profiles[0]
        })
      )
      .subscribe(
        data => {
          this.isCurrentUser = data.id === data.currentUser.id;
          this.userId = data.id;
          this.isCreate = !data.currentProfile;
          this.profile = data.profile || {};
          this.personsProfile = data.currentProfile || {};
          this.loading = false;
        },
        err => this.logger.warn('Failed to init profile', err)
      );
  }

  ngOnDestroy() {
    if (this.subProfile) {
      this.subProfile.unsubscribe();
    }
  }

  getCurrentUser() {
    return this.userService.getUser();
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  saveProfile() {
    const method = this.isCreate ? 'personCreateProfileByToken' : 'personUpdateProfileByToken';
    this.personService[method](this.getProfile(), this.userService.getToken())
      .subscribe(
        profile => {
          this.isCreate = false;
          this.profile = profile;
          this.personsProfile = profile;
          this.editing = false;
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
      image: this.profile.image,
      profileDescription: this.profile.profileDescription
    };
  }
}
