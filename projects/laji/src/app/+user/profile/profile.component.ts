import { concatMap, map, take } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ExtendedProfile, prepareProfile, UserService } from '../../shared/service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin as ObservableForkJoin, Subscription } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { SharedModule } from '../../shared/shared.module';
import { FindPersonModule } from '../../shared-modules/find-person/find-person.module';
import { FriendsComponent } from '../friends/friends.component';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { WithNullableKeys } from '../../shared/utils';

type Profile = components['schemas']['store-profile'];
type SensitiveProfile = components['schemas']['SensitiveProfile'];
type MediaIntellectualRights = components['schemas']['Image']['intellectualRights'];

@Component({
  selector: 'laji-user',
  templateUrl: './profile.component.html',
  imports: [
    TranslatePipe,
    LajiUiModule,
    SharedModule,
    FindPersonModule,
    FriendsComponent
  ],
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  viewedProfile!: WithNullableKeys<SensitiveProfile, 'profileDescription' | 'image'>;
  loggedInProfile!: ExtendedProfile;

  public viewedUserIsLoggedInUser = false;
  public viewedUserId = '';
  public isCreate = true;
  public editing = false;
  public loading = true;
  public personSelfUrl = '/';

  private subProfile!: Subscription;
  intellectualRightsArray: MediaIntellectualRights[] = [
    'MZ.intellectualRightsCC-BY-SA-4.0',
    'MZ.intellectualRightsCC-BY-NC-4.0',
    'MZ.intellectualRightsCC-BY-NC-SA-4.0',
    'MZ.intellectualRightsCC-BY-4.0',
    'MZ.intellectualRightsCC0-4.0',
    'MZ.intellectualRightsARR'
  ];

  constructor(private userService: UserService,
              private localizeRouterService: LocalizeRouterService,
              private route: ActivatedRoute,
              private router: Router,
              private logger: Logger,
              private cdr: ChangeDetectorRef,
              private api: LajiApiClientBService
  ) {
    this.personSelfUrl = environment.selfPage;
  }

  ngOnInit() {
    this.loading = true;
    this.subProfile = this.route.params.pipe(
      map(params => params['userId']),
      concatMap(viewedUserId => this.userService.user$.pipe(
        take(1),
        map(user => ({viewedUserId, loggedInUser: user}))
      )),
      concatMap(({loggedInUser, viewedUserId}) => {
        const loggedInProfile$ = this.api.get('/person/profile');
        return ObservableForkJoin(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          loggedInProfile$,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          loggedInUser!.id === viewedUserId
            ? loggedInProfile$
            : this.api.get('/person/{id}/profile', { path: { id: viewedUserId } })
        ).pipe(
          map(([loggedInProfile, viewedProfile]) => ({
            viewedUserId,
            loggedInUser,
            loggedInProfile,
            viewedProfile
          }))
        );
      })
    ).subscribe(
      ({viewedUserId, loggedInUser, loggedInProfile, viewedProfile}) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.viewedUserIsLoggedInUser = viewedUserId === loggedInUser!.id;
          this.viewedUserId = viewedUserId;
          this.isCreate = !loggedInProfile;
          this.viewedProfile = viewedProfile;
          this.loggedInProfile = prepareProfile(loggedInProfile, loggedInUser);
          this.loading = false;
          this.editing = false;
          this.cdr.detectChanges();
        },
        err => {
          this.logger.warn('Failed to init viewedProfile', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      );
  }

  ngOnDestroy() {
    if (this.subProfile) {
      this.subProfile.unsubscribe();
    }
  }

  getCurrentUser() {
    return this.userService.user$.pipe(take(1));
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  saveProfile() {
    this.loading = true;
    ((this.isCreate
      ? this.api.post('/person/profile', undefined, this.getSaveProfile() as any)
      : this.api.put('/person/profile', undefined, this.getSaveProfile() as any)
    ) as Observable<Profile>).subscribe(
        profile => {
          this.isCreate = false;
          this.loggedInProfile = profile as ExtendedProfile;
          this.editing = false;
          this.loading = false;
        },
        err => this.logger.warn('Failed to save profile', err)
      );
  }

  selectPerson(person: { id: string }) {
    if (!person.id) {
      return;
    }
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/user', person.id])
    );
  }

  private getSaveProfile(): Profile {
    return {
      ...this.loggedInProfile,
      image: this.loggedInProfile.image,
      profileDescription: this.loggedInProfile.profileDescription,
      personalCollectionIdentifier: this.loggedInProfile.personalCollectionIdentifier,
      settings: {
        ...this.loggedInProfile.settings,
        defaultMediaMetadata: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ...this.loggedInProfile.settings!.defaultMediaMetadata,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          capturerVerbatim: this.loggedInProfile?.settings?.defaultMediaMetadata?.capturerVerbatim!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          intellectualOwner: this.loggedInProfile?.settings?.defaultMediaMetadata?.intellectualOwner!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          intellectualRights: this.loggedInProfile?.settings?.defaultMediaMetadata?.intellectualRights!
        }
      }
    };
  }
}
