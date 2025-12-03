import { switchMap } from 'rxjs';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Logger } from '../../shared/logger/logger.service';
import { DialogService } from '../../shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { of as ObservableOf } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Profile } from '../../shared/model/Profile';

@Component({
    selector: 'laji-friends',
    templateUrl: './friends.component.html',
    standalone: false
})
export class FriendsComponent implements OnInit, OnChanges {
  @Input() profile!: Profile;
  @Input() usersProfile!: Profile;

  public requestSend = false;
  public friends = [];
  private lastId: string | undefined;

  constructor(private logger: Logger,
              private translateService: TranslateService,
              private dialogService: DialogService,
              private api: LajiApiClientBService
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
    return this.api.post('/person/friends/{id}', { path: { id: friendPersonID } }).subscribe(
      () => this.requestSend = true,
      () => this.requestSend = true
    );
  }

  removeFriend(userId: string, block = false) {
    this.translateService.get(['friend.blockConfirm', 'friend.removeConfirm']).pipe(
      switchMap(translation => this.dialogService.confirm(block ? translation['friend.blockConfirm'] : translation['friend.removeConfirm'])),
      switchMap((confirm) => confirm
        ? this.api.delete('/person/friends/{id}', { path: { id: userId }, query: { block } })
        : ObservableOf(this.usersProfile)
      ), )
      .subscribe(
        profile => this.usersProfile = profile as Profile,
        err => this.logger.warn('Failed remove friend', err)
      );
  }

  removeBlock(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.usersProfile.blocked = this.usersProfile.blocked!.filter(id => id !== userId);
    this.api.put('/person/profile', undefined, this.usersProfile as any)
      .subscribe(
        profile => this.usersProfile = profile as Profile,
        err => this.logger.warn('Failed remove block', err)
      );
  }

  acceptFriendRequest(userId: string) {
    this.api.put('/person/friends/{id}', { path: { id: userId } })
      .subscribe(
        profile => this.usersProfile = profile as Profile,
        err => this.logger.warn('Failed accept friend request', err)
      );
  }
}
