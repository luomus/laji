import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs';
import { FooterService } from '../core/footer.service';
import { cmsIds } from '../locale/cms-ids';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type Lang = 'fi' | 'sv' | 'en';

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  homeContent$ = this.translate.onLangChange.pipe(
    startWith({lang: this.translate.getCurrentLang()}),
    switchMap(event => this.api.get('/information/{id}', { path: { id: cmsIds['home'][<Lang>event.lang] } }))
  );
  constructor(private translate: TranslateService, private api: LajiApiClientBService, private footer: FooterService) {}
  ngOnInit() {
    this.footer.toggle(true);
  }
  ngOnDestroy() {
    this.footer.toggle(false);
  }
}
