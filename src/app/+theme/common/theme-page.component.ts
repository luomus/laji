import { Component, Input } from '@angular/core';
import { UserService } from '../../shared/service/user.service';

@Component({
    selector: 'laji-theme-page',
    template: `
<div class="container-fluid">
    <div class="row" id="wrapper">
        <div *ngIf='showNav' class="col-sm-3 col-md-2 col-lg-2 sidebar-nav">
            <h1 [innerHTML]="title | translate"></h1>
            <ul *ngIf="navLinks">
                <ng-container *ngFor="let link of navLinks">
                    <li>
                        <a [class]="link.active ? 'laji-sidebar-active' : ''"
                           [routerLink]="link.routerLink">
                            {{ link.label | translate }}
                        </a>
                        <ul *ngIf="link.children && link.active" class="nested">
                          <ng-container *ngFor="let childLink of link.children">
                            <li>
                              <a [class]="childLink.active ? 'laji-sidebar-active' : ''"
                                 [routerLink]="childLink.routerLink" >
                                {{ childLink.label | translate }}
                              </a>
                            </li>
                          </ng-container>
                        </ul>
                    </li>
                </ng-container>
            </ul>
            <laji-haseka-latest [userToken]="userService.getToken()"
                                [forms]="[formID]"
                                [tmpOnly]="true"
                                *ngIf="userService.isLoggedIn$ | async">
            </laji-haseka-latest>
            <ng-content select='nav'></ng-content>
        </div>
        <div class="content"
        [ngClass]="{'col-sm-9 col-md-10 col-lg-10': showNav}">
            <ng-content select='*'></ng-content>
        </div>
    </div>
</div>
    `,
    styles: [`
    :host {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
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
