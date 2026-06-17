import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  UtilitiesDumbDirectivesModule
} from '../../shared-modules/utilities/directive/dumb-directives/utilities-dumb-directives.module';
import { AlertModule } from '../../../../../laji-ui/src/lib/alert/alert.module';

@Component({
  imports: [
    AlertModule,
    TranslatePipe,
    UtilitiesDumbDirectivesModule
  ],
  template: `
    <div class="container">
      <lu-alert type="warning" style="padding-top: 20px" *lajiBrowserOnly>
        {{ 'user.pleaseLogin' | translate }}
      </lu-alert>
    </div>
  `
})
export class ProfilePleaseLoginComponent {
}
