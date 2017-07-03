import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-emk',
  templateUrl: './emk.component.html',
  styles: [`
    .alternative {
      background-color: #fffacf;
    }
  `]
})
export class EmkComponent {

  constructor(public translate: TranslateService) {}

}
