import { Component, OnInit, Input } from '@angular/core';
import { Profile } from '../../shared/model/Profile';
import { UserService } from '../../shared/service/user.service';
import { PersonApi } from '../../shared/api/PersonApi';

@Component({
  selector: 'friends',
  templateUrl: 'friends.component.html'
})
export class FriendsComponent implements OnInit {

  @Input() profile: Profile;
  @Input() usersProfile: Profile;

  public user;
  public requestSend = false;
  public friends = [];

  constructor(private userService: UserService,
              private personService: PersonApi) {
  }

  ngOnInit() {
    this.requestSend = false;
  }

  isLoggedIn() {
    return !!this.usersProfile.id;
  }

  isCurrentUser() {
    return this.profile.userID === this.usersProfile.userID;
  }

  alreadyFriends() {
    return this.usersProfile.friends && this.usersProfile.friends.indexOf(this.profile.userID) > -1;
  }

  sendFriendRequest(profileKy: string) {
    this.personService.personAddFriendRequest(
      this.userService.getToken(),
      profileKy
    ).subscribe(
      _ => this.requestSend = true,
      err => this.requestSend = true
    );
  }

  removeFriend(userId, block = false) {
    this.personService.personRemoveFriend(this.userService.getToken(), userId, block)
      .subscribe(
        profile => this.usersProfile = profile,
        err => console.log(err)
      );
  }

  removeBlock(userId) {
    this.usersProfile.blocked = this.usersProfile.blocked.filter(id => id !== userId);
    this.personService.personUpdateProfileByToken(this.usersProfile, this.userService.getToken())
      .subscribe(
        profile => this.usersProfile = profile,
        err => console.log(err)
      );
  }

  acceptFriendRequest(userId: string) {
    this.personService.personAcceptFriendRequest(this.userService.getToken(), userId)
      .subscribe(
        profile => this.usersProfile = profile,
        err => console.log(err)
      );
  }
}
