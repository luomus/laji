import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'laji-user-login',
  templateUrl: './user-login.component.html'
})
export class UserLoginComponent implements OnInit {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.location.replaceState('/', '');
    this.router.navigateByUrl('/');
  }

}
