import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { PagedResult } from 'app/shared/model/PagedResult';
import { Subject } from 'rxjs';
import { UserService } from 'app/shared/service/user.service';
import { LajiApiService, LajiApi } from 'app/shared/service/laji-api.service';
import { takeUntil, filter, switchMap } from 'rxjs/operators';
import { NotificationsFacade } from './notifications.facade';

@Component({
  selector: 'laji-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor(private facade: NotificationsFacade) {}

  ngOnInit(): void {
    this.facade.notifications$.subscribe((res) => {
      console.log(res);
    });
    this.facade.loadAll(0, 10);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
