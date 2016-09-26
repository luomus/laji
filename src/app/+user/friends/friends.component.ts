import {Component, OnInit, Input} from '@angular/core';
import {Profile} from "../../shared/model/Profile";
import {UserService} from "../../shared/service/user.service";
import {PersonApi} from "../../shared/api/PersonApi";

@Component({
  selector: 'friends',
  templateUrl: 'friends.component.html'
})
export class FriendsComponent implements OnInit {

  @Input() profile:Profile;
  @Input() currentlUser:boolean = false;

  public user;
  public requestSend = false;

  constructor(
    private userService:UserService,
    private personService:PersonApi
  ) {
  }

  ngOnInit() {
    this.requestSend = false;
    this.userService.getUser().subscribe(
      user => this.user = user,
      err => console.log(err)
    )
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
  }
}
