import { switchMap } from 'rxjs/operators';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Profile } from '../../shared/model/Profile';
import { UserService } from '../../shared/service/user.service';
import { PersonApi } from '../../shared/api/PersonApi';
import { Logger } from '../../shared/logger/logger.service';
import { DialogService } from '../../shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { of as ObservableOf } from 'rxjs';

@Component({
  selector: 'laji-friends',
  templateUrl: './friends.component.html'
})
export class FriendsComponent implements OnInit, OnChanges {
  @Input() profile!: Profile;
  @Input() usersProfile!: Profile;

  public requestSend = false;
  public friends = [];
  private lastId: string | undefined;

  constructor(private userService: UserService,
              private personService: PersonApi,
              private logger: Logger,
              private translateService: TranslateService,
              private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this.requestSend = false;
    this.lastId = this.profile.userID;
  }

  ngOnChanges() {
    if (this.lastId && this.lastId !== this.profile.userID) {
      this.lastId = this.profile.userID;
      this.requestSend = false;
    }
  }

  hasProfile() {
    return !!this.usersProfile.id;
  }

  isCurrentUser() {
    return this.profile.userID === this.usersProfile.userID;
  }

  alreadyFriends() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.usersProfile.friends && this.usersProfile.friends.indexOf(this.profile.userID!) > -1;
  }

  sendFriendRequest(friendPersonID: string) {
    this.personService.personAddFriendRequest(
      this.userService.getToken(),
      friendPersonID
    ).subscribe(
      () => this.requestSend = true,
      () => this.requestSend = true
    );
  }

  removeFriend(userId: string, block = false) {
    this.translateService.get(['friend.blockConfirm', 'friend.removeConfirm']).pipe(
      switchMap(translation => this.dialogService.confirm(block ? translation['friend.blockConfirm'] : translation['friend.removeConfirm'])),
      switchMap((confirm) => confirm ?
        this.personService.personRemoveFriend(this.userService.getToken(), userId, block) :
        ObservableOf(this.usersProfile)
      ), )
      .subscribe(
        profile => this.usersProfile = profile,
        err => this.logger.warn('Failed remove friend', err)
      );
  }

  removeBlock(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.usersProfile.blocked = this.usersProfile.blocked!.filter(id => id !== userId);
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
