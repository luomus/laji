import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/service/user.service';
import { LocalizeRouterService } from '../locale/localize-router.service';

@Component({
  selector: 'laji-user',
  template: ' ',
})
export class UserComponent implements OnInit {
  constructor(private userService: UserService,
              private localizeRouterService: LocalizeRouterService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.getUser().subscribe(
      user => {
        this.router.navigate(
          this.localizeRouterService.translateRoute((!user || !user.id) ? ['/'] : ['/user', user.id])
        )
      }
    );
  }
}
