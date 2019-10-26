import { Component, Inject, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { isPlatformServer } from '@angular/common';
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
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(RESPONSE) private response: any,
    private router: Router
  ) { }

  ngOnInit() {
    const url = this.router.url;
    if (url.startsWith('/fi/')) {
      this._redirecting = true;
      this.router.navigateByUrl(url.substr(3));
    }
    if (isPlatformServer(this.platformId)) {
      this.response.status(404);
    }
  }

}
