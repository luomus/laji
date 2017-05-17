import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'terms-of-service',
  templateUrl: './terms-of-service-of-service.component.html'
})
export class HaSeKaTermsOfServiceComponent implements OnInit {
  constructor(public translate: TranslateService) {
  }

  ngOnInit() {
  }

}
