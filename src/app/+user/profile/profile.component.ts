import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { PersonApi } from '../../shared/api/PersonApi';
import { Profile } from '../../shared/model/Profile';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

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

  private subProfile: Subscription;

  constructor(private userService: UserService,
              private personService: PersonApi,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.subProfile = this.route.params
      .do((_) => this.loading = true)
      .map(params => params['userId'])
      .combineLatest(this.userService.getUser(), (id, user) => ({id: id, currentUser: user}))
      .flatMap((data) => {
          let currentActive = data.currentUser.id === data.id;
          let empty$ = Observable.of({});
          let false$ = Observable.of(false);
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
        err => console.log(err)
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
    let method = this.isCreate ? 'personCreateProfileByToken' : 'personUpdateProfileByToken';
    this.personService[method](this.getProfile(), this.userService.getToken())
      .subscribe(
        profile => {
          this.isCreate = false;
          this.profile = profile;
          this.personsProfile = profile;
          this.editing = false;
        },
        err => console.log(err)
      );
  }

  private getProfile(): Profile {
    return {
      image: this.profile.image,
      profileDescription: this.profile.profileDescription
    };
  }
}
