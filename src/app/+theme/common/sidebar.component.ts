import { Component, Input } from '@angular/core';

@Component({
    selector: 'laji-sidebar',
    template: `
    <div class="container-fluid">
    <div class="row" id="wrapper">
      <div style="background-color: #ECF0F1;" class="col-sm-3 col-md-2 col-lg-2">
        <h1>{{title}}</h1>
        <ul class="sidebar-nav">
            <ng-content select='nav'></ng-content>
        </ul>
      </div>
      <div class="col-sm-9 col-md-10 col-lg-10 main-content" class="col-sm-9 col-md-10 col-lg-10">
        <ng-content select='*'></ng-content>
      </div>
    </div>
  </div>
    `,
    styles: [`
    :host {
        display: flex;
        flex: 1 0 auto;
    }
    .main-content {
        margin-bottom: 20px !important;
    }
    @media only screen and (min-width : 768px) {
        #wrapper {
            display: flex;
        }
    }
    .laji-sidebar-active {
        background: white;
    }
    `]
})
export class SidebarComponent {
    @Input() title: string;
}