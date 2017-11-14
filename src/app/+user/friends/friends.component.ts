import { Component, Input, OnInit } from '@angular/core';
import { Profile } from '../../shared/model/Profile';
import { UserService } from '../../shared/service/user.service';
import { PersonApi } from '../../shared/api/PersonApi';
import { Logger } from '../../shared/logger/logger.service';
import { DialogService } from '../../shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'friends',
  templateUrl: './friends.component.html'
})
export class FriendsComponent implements OnInit {

  @Input() profile: Profile;
  @Input() usersProfile: Profile;

  public user;
  public requestSend = false;
  public friends = [];

  constructor(private userService: UserService,
              private personService: PersonApi,
              private logger: Logger,
              private translateService: TranslateService,
              private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this.requestSend = false;
  }

  hasProfile() {
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
    this.translateService.get(block ? 'friend.blockConfirm' : 'friend.removeConfirm')
      .switchMap(confirmMessage => this.dialogService.confirm(confirmMessage))
      .switchMap((confirm) => confirm ?
        this.personService.personRemoveFriend(this.userService.getToken(), userId, block) :
        Observable.of(this.usersProfile)
      )
      .subscribe(
        profile => this.usersProfile = profile,
        err => this.logger.warn('Failed remove friend', err)
      );
  }

  removeBlock(userId) {
    this.usersProfile.blocked = this.usersProfile.blocked.filter(id => id !== userId);
    this.personService.personUpdateProfileByToken(this.usersProfile, this.userService.getToken())
      .subscribe(
        profile => this.usersProfile = profile,
        err => this.logger.warn('Failed remove block', err)
      );
  }

  acceptFriendRequest(userId: string) {
    this.personService.personAcceptFriendRequest(this.userService.getToken(), userId)
      .subscribe(
        profile => this.usersProfile = profile,
        err => this.logger.warn('Failed accept friend request', err)
      );
  }
}
