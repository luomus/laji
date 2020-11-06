import { Component, Inject, OnInit, Optional } from '@angular/core';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-not-found',
  template: `<div class="container-fluid" *ngIf="!_redirecting">
      <h1>{{ 'error.404.title'|translate }}</h1>
      <p>{{ 'error.404.intro'|translate }}</p>
  </div>`
})
export class NotFoundComponent implements OnInit {

  _redirecting = false;

  constructor(
    @Optional() @Inject(RESPONSE) private response: any,
    private router: Router
  ) { }

  ngOnInit() {
    const url = this.router.url;
    if (url.startsWith('/fi/')) {
      this._redirecting = true;
      this.router.navigateByUrl(url.substr(3));
    }
    if (this.response) {
      this.response.statusCode = 404;
      this.response.statusMessage = 'Not Found';
    }
  }

}
