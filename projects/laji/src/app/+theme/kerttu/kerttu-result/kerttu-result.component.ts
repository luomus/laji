import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {KerttuApi} from '../service/kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import { Observable } from 'rxjs';
import {map, take} from 'rxjs/operators';
import {IKerttuStatistics, IUserStatistics} from '../models';

@Component({
  selector: 'laji-kerttu-result',
  templateUrl: './kerttu-result.component.html',
  styleUrls: ['./kerttu-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuResultComponent implements OnInit {
  generalStats$: Observable<IKerttuStatistics>;
  userList$: Observable<IUserStatistics[]>;
  userId$: any;

  constructor(
    private kerttuApi: KerttuApi,
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userService.isLoggedIn$.pipe(
      take(1)
    ).subscribe(isLoggedIn => {
      const token = isLoggedIn ? this.userService.getToken() : undefined;
      this.generalStats$ = this.kerttuApi.getGeneralStats(token);
      this.userList$ = this.kerttuApi.getUsersStats(token);
      this.userId$ = this.userService.user$.pipe(map(user => user?.id));
      this.cd.markForCheck();
    });
  }

}
