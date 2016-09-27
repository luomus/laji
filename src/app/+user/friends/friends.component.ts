import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Profile} from "../../shared/model/Profile";
import {UserService} from "../../shared/service/user.service";
import {PersonApi} from "../../shared/api/PersonApi";
import {Observer, Observable} from "rxjs";

@Component({
  selector: 'friends',
  templateUrl: 'friends.component.html'
})
export class FriendsComponent implements OnInit, OnChanges {

  @Input() profile:Profile;
  @Input() usersProfile:Profile;

  public user;
  public requestSend = false;
  public friends = [];

  constructor(
    private userService:UserService,
    private personService:PersonApi
  ) {
  }

  ngOnInit() {
    this.requestSend = false;
    this.initFriends();
  }

  ngOnChanges() {
    this.initFriends();
  }

  isLoggedIn() {
    return !!this.usersProfile.id
  }

  isCurrentUser() {
    return this.profile.userID === this.usersProfile.userID
  }

  alreadyFriends() {
    return this.usersProfile.friends && this.usersProfile.friends.indexOf(this.profile.userID) > -1;
  }

  initFriends() {
    if (!this.usersProfile.friends || this.usersProfile.friends.length == 0) {
      return;
    }
    let requests = [];
    this.usersProfile.friends.map(qname => {
      requests.push(this.personService.personFindByUserId(qname));
    });
    return Observable.forkJoin(requests).subscribe(data => this.friends = data)
  }

  sendFriendRequest(profileKy:string) {
    this.personService.personAddFriendRequest(
      this.userService.getToken(),
      profileKy
    ).subscribe(
      _ => this.requestSend = true,
      err => this.requestSend = true
    )
  }

  acceptFriendRequest(userId:string) {
    this.personService.personAcceptFriendRequest(
        this.userService.getToken(),
        userId
      )
      .subscribe(
        profile => this.profile = profile,
        err => console.log(err)
      )
  }

  blockFriendRequest(userId:string) {

  }
}
