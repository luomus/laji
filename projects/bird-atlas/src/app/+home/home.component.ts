import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs/operators';
import { LajiApiService } from '../core/api.service';
import { cmsIds } from '../locale/cms-ids';

@Component({
  selector: 'ba-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  homeContent$ = this.translate.onLangChange.pipe(
    startWith({lang: this.translate.currentLang}),
    switchMap(event => this.api.getInformation(cmsIds['home'][event.lang]))
  );
  constructor(private translate: TranslateService, private api: LajiApiService) {}
}
