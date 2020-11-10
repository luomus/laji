import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-emk',
  templateUrl: './emk.component.html',
  styles: [`
    .alternative {
      background-color: #fffacf;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmkComponent {

  constructor(public translate: TranslateService) {}

}
