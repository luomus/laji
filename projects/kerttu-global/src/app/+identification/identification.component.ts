import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

@Component({
  selector: 'bsg-identification',
  template: `
    <lu-sidebar>
      <nav>
        <h5>
          <span [innerHTML]="'theme.kerttu' | translate"></span>
        </h5>
        <lu-sidebar-link [link]="['instructions'] | localize" routerLinkActive>
          {{ 'instructions' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['expertise'] | localize" routerLinkActive>
          {{ 'theme.kerttu.expertise' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['recordings'] | localize" routerLinkActive>
          {{ 'theme.kerttu.recordingAnnotation' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['results'] | localize" routerLinkActive>
          {{ 'theme.kerttu.result' | translate }}
        </lu-sidebar-link>
      </nav>
      <main>
        <div class="container-fluid laji-page">
          <router-outlet></router-outlet>
        </div>
      </main>
    </lu-sidebar>
  `,
  styles: [`
    :host {
        display: flex;
        flex: 1 0 auto;
        width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationComponent {
  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService
  ) { }
}
