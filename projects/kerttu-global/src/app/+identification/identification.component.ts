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
          {{ 'expertise.title' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['recordings'] | localize" routerLinkActive>
          {{ 'identification.mainSection' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['results'] | localize" routerLinkActive>
          {{ 'results.title' | translate }}
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
