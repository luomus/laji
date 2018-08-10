import { Component, Inject, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'laji-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              @Optional() @Inject(RESPONSE) private response: any) { }

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.response.status(404);
    }
  }

}
