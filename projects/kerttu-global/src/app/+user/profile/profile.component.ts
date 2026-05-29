import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Logger } from '../../../../../laji/src/app/shared/logger';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '../../../../../laji/src/app/shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { clone } from '../../../../../laji/src/app/shared/utils';

type Profile = components['schemas']['store-profile'];


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
  profile?: Profile;
  loading = true;
  personSelfUrl = '/';

  private subProfile!: Subscription;

  constructor(
    private logger: Logger,
    private cdr: ChangeDetectorRef,
    private api: LajiApiClientBService
  ) {
    this.personSelfUrl = environment.selfPage;
  }

  ngOnInit() {
    this.loading = true;
    this.subProfile = this.api.get('/person/profile').subscribe({
      next: profile => {
        this.profile = clone(profile);
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
      next :profile => {
        this.profile = profile;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: err => this.logger.warn('Failed to save profile', err)
    });
  }
}
