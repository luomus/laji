import { Component, Input } from '@angular/core';

@Component({
    selector: 'laji-sidebar',
    template: `
<div class="container-fluid">
    <div class="row" id="wrapper">
        <div class="col-sm-3 col-md-2 col-lg-2 sidebar-nav">
            <h1>{{title}}</h1>
            <ng-content select='nav'></ng-content>
        </div>
        <div class="col-sm-9 col-md-10 col-lg-10 content">
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
        padding: 2em 5em;
        padding-top: 1em;
    }
    @media only screen and (min-width : 768px) {
        #wrapper {
            display: flex;
        }
    }
    `]
})
export class SidebarComponent {
    @Input() title: string;
}
