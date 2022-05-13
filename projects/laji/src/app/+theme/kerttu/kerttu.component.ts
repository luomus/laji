import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
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
        <lu-sidebar-link [link]="['letters'] | localize" routerLinkActive>
          {{ 'theme.kerttu.letterAnnotation' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['recordings'] | localize" routerLinkActive>
          {{ 'theme.kerttu.recordingAnnotation' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['result'] | localize" routerLinkActive>
          {{ 'theme.kerttu.result' | translate }}
        </lu-sidebar-link>
      </nav>
      <main>
        <router-outlet></router-outlet>
      </main>
    </lu-sidebar>
  `,
  styles: [`
    :host {
        display: flex;
        flex: 1 0 auto;
        width: 100%;
    }
    :host ::ng-deep .checkbox label {
      display: initial;
      font-weight: 700;
    }

    @media only screen and (min-width : 768px) {
      main {
        padding: 20px 40px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuComponent {}
