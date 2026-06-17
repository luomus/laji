import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { Logger } from '../../../../../laji/src/app/shared/logger';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '../../../../../laji/src/app/shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { components } from 'projects/laji-api-client/generated/api.d';
import { XenoCantoAnnotationSet } from '../../bsg-shared/models';
import { xenoCantoLicenses } from '../../bsg-shared/variables';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';

type Profile = components['schemas']['store-profile'];
type Person = components['schemas']['Person'];

type ProfileWithSettings = Profile & {
  settings: {
    defaultXenoCantoAnnotationSetMetadata: Partial<XenoCantoAnnotationSet>;
  };
};

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
  profile?: ProfileWithSettings;
  loading = true;
  personSelfUrl = '/';
  licenseOptions = xenoCantoLicenses;

  private subProfile!: Subscription;

  constructor(
    private logger: Logger,
    private cdr: ChangeDetectorRef,
    private api: LajiApiClientService,
    private userService: UserService,
  ) {
    this.personSelfUrl = environment.selfPage;
  }

  ngOnInit() {
    this.loading = true;
    this.subProfile = forkJoin([
      this.api.get('/person/profile'),
      this.userService.user$.pipe(take(1))
    ]).subscribe({
      next: ([profile, user]) => {
        this.profile = this.prepareProfile(profile, user);
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
    this.api.put('/person/profile', undefined, this.profile).subscribe({
      next: profile => {
        this.profile = this.prepareProfile(profile);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: err => this.logger.warn('Failed to save profile', err)
    });
  }

  private prepareProfile(profile: Profile, user?: Person): ProfileWithSettings {
    const defaultAnnotationSet: Partial<XenoCantoAnnotationSet> = {
      setLicense: 'CC-BY-NC-SA',
      setCreator: user?.fullName || '',
      setOwner: user?.fullName || ''
    };
    const currentAnnotationSet = profile.settings?.defaultXenoCantoAnnotationSetMetadata as Partial<XenoCantoAnnotationSet> | undefined;

    return {
      ...profile,
      settings: {
        ...(profile.settings || {}),
        defaultXenoCantoAnnotationSetMetadata: currentAnnotationSet || defaultAnnotationSet
      }
    };
  }
}
