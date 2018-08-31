import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-terms-of-service',
  templateUrl: './terms-of-service-of-service.component.html',
  styleUrls: ['./terms-of-service-of-service.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaTermsOfServiceComponent implements OnInit {
  constructor(public translate: TranslateService) {
  }

  ngOnInit() {
  }

}
