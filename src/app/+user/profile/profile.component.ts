import {Component, OnInit} from '@angular/core';
import {UserService} from "../../shared/service/user.service";
import {PersonApi} from "../../shared/api/PersonApi";
import {Profile} from "../../shared/model/Profile";

@Component({
  selector: 'laji-user',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile:Profile = {
    image: "",
    profileDescription: "",
    friendRequests: [],
    friends: [],
    blocked: []
  };

  public editing = false;
  private isCreate = false;

  constructor(
    private userService:UserService,
    private personService:PersonApi
  ) {}

  ngOnInit() {
    this.initProfile();
  }

  initProfile() {
    this.personService
      .personFindProfileByToken(this.userService.getToken())
      .subscribe(
        profile => this.profile = profile,
        err => {
          console.log(err);
          this.isCreate = true;
        }
      )
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  saveProfile() {
    if (this.isCreate) {
      this.personService.personCreateProfileByToken(this.getProfile(), this.userService.getToken())
        .subscribe(
          profile => {
            this.isCreate = false;
            this.profile = profile
            this.editing = false;
          },
          err => console.log(err)
        )
    } else {
      console.log(this.getProfile());
      this.personService.personUpdateProfileByToken(this.getProfile(), this.userService.getToken())
        .subscribe(
          profile => {
            this.profile = profile;
            this.editing = false;
          },
          err => console.log(err)
        )
    }
  }

  private getProfile():Profile {
    return {
      image: this.profile.image,
      profileDescription: this.profile.profileDescription
    };
  }
}
