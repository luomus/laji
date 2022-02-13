import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Information, LajiApiClient } from 'projects/laji-api-client/src/public-api';
import { Observable, Subject } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { cmsIds } from '../locale/cms-ids';

@Component({
  selector: 'ba-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  homeContent$: Observable<Information>;
  constructor(private translate: TranslateService, private api: LajiApiClient) {}
  ngOnInit() {
    this.homeContent$ = this.translate.onLangChange.pipe(
      startWith({lang: this.translate.currentLang}),
      switchMap(event => this.api.get(
        LajiApiClient.Endpoints.information,
        cmsIds['home'][event.lang],
        {lang: 'fi'}
      )),
      takeUntil(this.unsubscribe$)
    );
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
