import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {KerttuApi} from '../service/kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import {Observable, Subscription} from 'rxjs';
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
  generalStats$: Observable<IKerttuStatistics>;
  userList$: Observable<IUserStatistics[]>;
  userId$: any;

  nameVisibility: boolean;

  private nameVisibilitySub: Subscription;

  constructor(
    private kerttuApi: KerttuApi,
    private userService: UserService,
    private personService: PersonApi,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userService.isLoggedIn$.pipe(
      take(1)
    ).subscribe(isLoggedIn => {
      const token = isLoggedIn ? this.userService.getToken() : undefined;
      this.generalStats$ = this.kerttuApi.getGeneralStats(token);
      this.userList$ = this.kerttuApi.getUsersStats(token);
      if (isLoggedIn) {
        this.userId$ = this.userService.user$.pipe(map(user => user?.id));
        this.personService.personFindProfileByToken(token).pipe(map(profile => profile.nameVisibleInKerttu || false)).subscribe(value => {
          this.nameVisibility = value;
          this.cd.markForCheck();
        });
      }
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
}
