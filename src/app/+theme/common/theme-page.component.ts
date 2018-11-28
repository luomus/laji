import { Component, Input } from '@angular/core';

@Component({
    selector: 'laji-theme-page',
    template: `
<div class="container-fluid">
    <div class="row" id="wrapper">
        <div *ngIf='showNav' class="col-sm-3 col-md-2 col-lg-2 sidebar-nav">
            <h1>{{title}}</h1>
            <ul *ngIf="navLinks">
                <ng-container *ngFor="let link of navLinks">
                    <li *ngIf="link.visible">
                        <a routerLinkActive="laji-sidebar-active"
                           [routerLink]="link.routerLink">
                            {{link.label}}
                        </a>
                    </li>
                </ng-container>
            </ul>
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
        height: 100%;
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
    // tslint:disable-next-line:whitespace
    @Input() showNav? = true;
}
