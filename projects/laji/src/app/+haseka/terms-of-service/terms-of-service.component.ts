import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-terms-of-service',
  templateUrl: './terms-of-service-of-service.component.html',
  styleUrls: ['./terms-of-service-of-service.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaTermsOfServiceComponent {
  constructor(public translate: TranslateService) {
  }

}
