import {Component, OnInit, OnDestroy} from '@angular/core';
import {UserService} from "../../shared/service/user.service";
import {PersonApi} from "../../shared/api/PersonApi";
import {Profile} from "../../shared/model/Profile";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {Person} from "../../shared/model/Person";

@Component({
  selector: 'laji-user',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit ,OnDestroy {

  profile:Profile = {
    image: "",
    profileDescription: "",
    friendRequests: [],
    friends: [],
    blocked: []
  };

  usersProfile:Profile = {};

  public person:Person = {
    preferredName: '',
    inheritedName: ''
  };

  public isCurrentUser = false;
  public userId = '';
  public isCreate = true;
  public editing = false;

  private subProfile:Subscription;

  constructor(
    private userService:UserService,
    private personService:PersonApi,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subProfile = this.route.params
      .map(params => params['userId'])
      .do(id => this.userId = id)
      .switchMap(id => this.userService.isLoggedIn() ? this.userService.getUser() : Observable.of(''))
      .map(idOrUser => idOrUser.id ? idOrUser.id : idOrUser)
      .switchMap(id =>  {
        this.isCurrentUser = this.userId === id;
        return Observable.forkJoin(
          this.isCurrentUser ?
          [
            this.personService.personFindProfileByToken(this.userService.getToken()),
            this.userService.getUser()
          ]:[
            this.personService.personFindProfileByUserId(this.userId),
            this.personService.personFindByUserId(this.userId),
            id ? this.personService.personFindProfileByToken(this.userService.getToken()) : Observable.of({})
          ]
        )
      })
      .subscribe(
        data => {
          this.isCreate = !data[0];
          this.profile = data[0];
          this.person = data[1];
          this.usersProfile = data[2] ? data[2] : data[0];
        },
        err => console.log(err)
      )
  }

  ngOnDestroy() {
    if (this.subProfile) {
      this.subProfile.unsubscribe();
    }
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  saveProfile() {
    let method = this.isCreate ? 'personCreateProfileByToken': 'personUpdateProfileByToken';
    this.personService[method](this.getProfile(), this.userService.getToken())
      .subscribe(
        profile => {
          this.isCreate = false;
          this.profile = profile;
          this.editing = false;
        },
        err => console.log(err)
      )
  }

  private getProfile():Profile {
    return {
      image: this.profile.image,
      profileDescription: this.profile.profileDescription
    };
  }
}
