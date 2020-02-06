import { Component, Input } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Global } from '../../../environments/global';

@Component({
    selector: 'laji-theme-page',
    template: `
<lu-sidebar [open]="showNav">
  <nav>
    <h4 [innerHTML]="title | translate"></h4>
    <lu-sidebar-link *ngFor="let link of navLinks; trackBy: trackByLabel" [link]="link.routerLink" routerLinkActive>
      {{ link.label | translate }}
      <lu-sidebar-link *ngFor="let child of link.children; trackBy: trackByLabel" [link]="child.routerLink">
        {{ child.label | translate }}
      </lu-sidebar-link>
    </lu-sidebar-link>
    <laji-haseka-latest [forms]="[formID]"
                        [tmpOnly]="true"
                        *ngIf="noLatestForForm !== formID && (userService.isLoggedIn$ | async)">
    </laji-haseka-latest>
  </nav>
  <main>
    <ng-content select='*'></ng-content>
  </main>
</lu-sidebar>
    `,
    styles: [`
:host {
  width: 100%;
}

h4 {
  max-width: 200px;
}

@media only screen and (min-width : 768px) {
  main {
    padding: 20px 40px;
  }
}
    `]
})
export class ThemePageComponent {
    @Input() title: string;
    @Input() navLinks?:
        {
            routerLink: string[], label: string, visible: boolean, children: any
        }[];
    @Input() showNav ? = true;
    @Input() formID: string;

    noLatestForForm = Global.forms.default;

    constructor(public userService: UserService) { }

    trackByLabel(index, link) {
      return link.label;
    }
}
