import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResultService } from '../iucn-shared/service/result.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'iucn-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  constructor(
    public iucnService: ResultService,
    public translate: TranslateService
  ) { }
}
