import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Information } from 'projects/laji-api-client/src/public-api';
import { Observable, Subject } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ApiService, Lang } from '../core/api.service';
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
  constructor(private translate: TranslateService, private api: ApiService) {}
  ngOnInit() {
    this.homeContent$ = this.translate.onLangChange.pipe(
      startWith({lang: this.translate.currentLang}),
      switchMap(event => this.api.getInformation(cmsIds['home'][event.lang])),
      takeUntil(this.unsubscribe$)
    );
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
