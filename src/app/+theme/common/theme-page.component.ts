import { Component, Input } from '@angular/core';
import { UserService } from '../../shared/service/user.service';

@Component({
    selector: 'laji-theme-page',
    template: `
<lu-sidebar>
  <nav>
    <h4>Vieraslajit</h4>
    <lu-sidebar-link *ngFor="let link of navLinks" [link]="link.routerLink" routerLinkActive>
      {{ link.label | translate }}
      <lu-sidebar-link *ngFor="let child of link.children" [link]="child.routerLink">
        {{ child.label | translate }}
      </lu-sidebar-link>
    </lu-sidebar-link>
  </nav>
  <main>
    <ng-content select='*'></ng-content>
  </main>
</lu-sidebar>
    `,
    styles: [`
    :host {
        display: flex;
        flex-direction: column;
        flex: 1 0;
    }
    h1 {
        padding-left: 10px;
    }
    .sidebar-nav {
        background-color: #ECF0F1;
    }
    .content {
        padding: 2em 2em;
        padding-top: 1em;
    }
    .nested li a {
      padding-left: 55px;
    }
    @media only screen and (min-width : 768px) {
        #wrapper {
            display: flex;
        }
    }
    `]
})
export class ThemePageComponent {
    @Input() title: string;
    @Input() navLinks?:
        {
            routerLink: string[], label: string, visible: boolean
        }[];
    @Input() showNav ? = true;
    @Input() formID: string;

    constructor(private userService: UserService) { }
}
