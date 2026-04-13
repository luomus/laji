import { catchError, map, switchMap, take } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Profile } from '../../../../../laji/src/app/shared/model/Profile';
import { prepareProfile, UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { Logger } from '../../../../../laji/src/app/shared/logger';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '../../../../../laji/src/app/shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';


@Component({
  selector: 'bsg-user',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [
    TranslatePipe,
    SharedModule,
    LajiUiModule
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {

  userProfile?: Profile;
  isCreate = true;
  loading = true;
  personSelfUrl = '/';

  private subProfile!: Subscription;

  constructor(
    private userService: UserService,
    private logger: Logger,
    private cdr: ChangeDetectorRef,
    private api: LajiApiClientBService
  ) {
    this.personSelfUrl = environment.selfPage;
  }

  ngOnInit() {
    this.loading = true;
    this.subProfile = this.userService.user$.pipe(
      take(1),
      switchMap(user  => {
        const userProfile$ = this.api.get('/person/profile').pipe(
          catchError(() => of(undefined))
        );
        return userProfile$.pipe(
          map(userProfile => ({
            user,
            userProfile
          }))
        );
      })
    ).subscribe({
      next: ({user, userProfile}) => {
        this.isCreate = !userProfile;
        this.userProfile = prepareProfile(userProfile, user);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        this.logger.warn('Failed to init profile', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (this.subProfile) {
      this.subProfile.unsubscribe();
    }
  }

  saveProfile() {
    this.loading = true;
    ((this.isCreate
        ? this.api.post('/person/profile', undefined, this.userProfile)
        : this.api.put('/person/profile', undefined, this.userProfile)
    )).subscribe({
      next :profile => {
        this.isCreate = false;
        this.userProfile = profile;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: err => this.logger.warn('Failed to save profile', err)
    });
  }
}
