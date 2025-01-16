import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs/operators';
import { LajiApiService, Lang } from '../core/api.service';
import { FooterService } from '../core/footer.service';
import { cmsIds } from '../locale/cms-ids';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  homeContent$ = this.translate.onLangChange.pipe(
    startWith({lang: this.translate.currentLang}),
    switchMap(event => this.api.getInformation(cmsIds['home'][<Lang>event.lang]))
  );
  constructor(private translate: TranslateService, private api: LajiApiService, private footer: FooterService) {}
  ngOnInit() {
    this.footer.toggle(true);
  }
  ngOnDestroy() {
    this.footer.toggle(false);
  }
}
