import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bsg-validation',
  template: `
    <lu-sidebar>
      <nav>
        <lu-sidebar-link [link]="['instructions'] | localize" routerLinkActive>
          {{ 'instructions' | translate }}
        </lu-sidebar-link>
        <lu-sidebar-link [link]="['species'] | localize" routerLinkActive>
          {{ 'speciesList.title' | translate }}
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
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationComponent{

}
