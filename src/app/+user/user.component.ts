import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/service/user.service';

@Component({
  selector: 'laji-user',
  template: '',
})
export class UserComponent implements OnInit {
  constructor(private userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.getUser().subscribe(
      user => this.router.navigate(['/user', user.id])
    );
  }
}
