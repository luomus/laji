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

  public person:Person = {
    preferredName: '',
    inheritedName: ''
  };

  public isCurenntUesr = false;

  private subProfile:Subscription;

  constructor(
    private userService:UserService,
    private personService:PersonApi,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subProfile = this.route.params
      .map(params => params['userId'])
      .switchMap(id => Observable.forkJoin(
        this.personService.personFindProfileByUserId(id),
        this.personService.personFindByUserId(id),
        this.userService.getUser()
      ))
      .subscribe(
        data => {
          this.profile = data[0];
          this.person = data[1];
          this.isCurenntUesr = data[1].id === data[2].id
        },
        err => console.log(err)
      )
  }

  ngOnDestroy() {
    if (this.subProfile) {
      this.subProfile.unsubscribe();
    }
  }
}
