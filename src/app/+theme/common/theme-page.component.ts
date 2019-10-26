import { Component, Input } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Global } from '../../../environments/global';

@Component({
    selector: 'laji-theme-page',
    template: `
<lu-sidebar>
  <nav>
    <h3 [innerHTML]="title | translate"></h3>
    <lu-sidebar-link *ngFor="let link of navLinks" [link]="link.routerLink" routerLinkActive>
      {{ link.label | translate }}
      <lu-sidebar-link *ngFor="let child of link.children" [link]="child.routerLink">
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
    `
})
export class ThemePageComponent {
    @Input() title: string;
    @Input() navLinks?:
        {
            routerLink: string[], label: string, visible: boolean
        }[];
    @Input() showNav ? = true;
    @Input() formID: string;

    noLatestForForm = Global.forms.default;

    constructor(public userService: UserService) { }
}
