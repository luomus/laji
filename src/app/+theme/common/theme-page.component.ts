import { Component, Input } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Global } from '../../../environments/global';

@Component({
    selector: 'laji-theme-page',
    template: `
<lu-sidebar [open]="showNav">
  <nav>
    <h5>
      <span [innerHTML]="title | translate"></span>
      <small *ngIf="secondary"><br>sekundääridataa</small>
    </h5>
    <lu-sidebar-link *ngFor="let link of navLinks; trackBy: trackByLabel" [link]="link.routerLink | localize" routerLinkActive>
      {{ link.label | translate }}
      <lu-sidebar-link *ngFor="let child of link.children; trackBy: trackByLabel" [link]="child.routerLink | localize">
        {{ child.label | translate }}
      </lu-sidebar-link>
    </lu-sidebar-link>
    <laji-haseka-latest [forms]="[formID]"
                        [tmpOnly]="true"
                        *ngIf="!secondary && noLatestForForm !== formID && (userService.isLoggedIn$ | async)">
    </laji-haseka-latest>
  </nav>
  <main>
    <ng-content select='*'></ng-content>
  </main>
</lu-sidebar>
    `,
    styleUrls: ['./theme-page.component.scss']
})
export class ThemePageComponent {
    @Input() title: string;
    @Input() secondary: boolean;
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
