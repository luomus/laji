import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bsg-identification',
  template: `
    <lu-sidebar>
      <nav>
        <lu-sidebar-link [link]="['instructions'] | localize" routerLinkActive>
          {{ 'instructions' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['expertise'] | localize" routerLinkActive>
          {{ 'theme.kerttu.expertise' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['recordings'] | localize" routerLinkActive>
          {{ 'identification.recordings' | translate }}
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

}
