import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {KerttuApi} from '../service/kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import {Observable, of, Subscription} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {IKerttuStatistics, IUserStatistics} from '../models';
import {PersonApi} from '../../../shared/api/PersonApi';

@Component({
  selector: 'laji-kerttu-result',
  templateUrl: './kerttu-result.component.html',
  styleUrls: ['./kerttu-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuResultComponent implements OnInit, OnDestroy {
  stats$: Observable<{general: IKerttuStatistics, users: IUserStatistics[]}>;

  userId: string;
  nameVisibility: boolean;

  private nameVisibilitySub: Subscription;

  constructor(
    private kerttuApi: KerttuApi,
    private userService: UserService,
    private personService: PersonApi,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getUserId().subscribe(userId => {
      const token = userId ? this.userService.getToken() : undefined;

      this.stats$ = this.kerttuApi.getUsersStats(token).pipe(map(users => {
        return {
          general: this.generalStatsFromUserStats(users, userId),
          users: users
        };
      }));

      if (userId) {
        this.nameVisibilitySub = this.personService.personFindProfileByToken(token).pipe(
          map(profile => profile.nameVisibleInKerttu || false)
        ).subscribe(value => {
          this.nameVisibility = value;
          this.cd.markForCheck();
        });
      }

      this.userId = userId;
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.nameVisibilitySub) {
      this.nameVisibilitySub.unsubscribe();
    }
  }

  saveNameVisibility(nameVisibility: boolean) {
    this.nameVisibility = undefined;
    this.nameVisibilitySub = this.personService.personFindProfileByToken(this.userService.getToken()).pipe(
      switchMap(profile => {
        profile.nameVisibleInKerttu = nameVisibility;

        return this.personService.personUpdateProfileByToken(profile, this.userService.getToken()).pipe(
          map(() => (nameVisibility))
        );
      })).subscribe(value => {
        this.nameVisibility = value;
        this.cd.markForCheck();
      });
  }

  private getUserId(): Observable<string> {
    return this.userService.isLoggedIn$.pipe(
      take(1),
      switchMap(isLoggedIn => {
        if (isLoggedIn) {
          return this.userService.user$.pipe(map(user => user?.id));
        }
        return of(undefined);
      })
    );
  }

  private generalStatsFromUserStats(userList: IUserStatistics[], userId?: string): IKerttuStatistics {
    let letterAnnotationCount = 0;
    let recordingAnnotationCount = 0;
    let userLetterAnnotationCount = 0;
    let userRecordingAnnotationCount = 0;

    userList.forEach(userStat => {
      if (userId && userStat.userId === userId) {
        userLetterAnnotationCount += userStat.letterAnnotationCount;
        userRecordingAnnotationCount += userStat.recordingAnnotationCount;
      }
      letterAnnotationCount += userStat.letterAnnotationCount;
      recordingAnnotationCount += userStat.recordingAnnotationCount;
    });

    return {
      letterAnnotationCount,
      recordingAnnotationCount,
      userLetterAnnotationCount,
      userRecordingAnnotationCount
    };
  }
}
