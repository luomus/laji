import { Component, Input, OnInit } from '@angular/core';
import { Router, Event, NavigationStart } from '@angular/router';
import { UserService } from '../../shared/service/user.service';
import { Global } from '../../../environments/global';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';
import { Document } from '../../shared/model/Document';

@Component({
    selector: 'laji-theme-page',
    template: `
<lu-sidebar [open]="showNav">
  <nav>
    <h5>
      <span [innerHTML]="title | translate"></span>
      <small *ngIf="secondary"><br>sekundääridataa</small>
    </h5>
    <lu-sidebar-link *ngFor="let link of navLinks; trackBy: trackByLabel" [link]="link.routerLink | localize" routerLinkActive [active]="link.active">
      {{ link.label | translate }}
      <lu-sidebar-link *ngFor="let child of link.children; trackBy: trackByLabel" [link]="child.routerLink | localize" [active]="child.active">
        {{ child.label | translate }}
      </lu-sidebar-link>
    </lu-sidebar-link>
    <laji-haseka-latest [forms]="[formID]"
                        [tmpOnly]="false"
                        (showViewer)="showDocumentViewer($event)"
                        *ngIf="!secondary && noLatestForForm !== formID && (userService.isLoggedIn$ | async) && !routeHidden">
    </laji-haseka-latest>
  </nav>
  <main>
    <ng-content select='*'></ng-content>
  </main>
</lu-sidebar>
    `,
    styleUrls: ['./theme-page.component.scss']
})
export class ThemePageComponent implements OnInit{
    @Input() title: string;
    @Input() secondary: boolean;
    @Input() navLinks?:
        {
            routerLink: string[], label: string, visible: boolean, children: any, active?: boolean
        }[];
    @Input() showNav ? = true;
    @Input() formID: string;

    noLatestForForm = Global.forms.default;
    allowHasekaLatest = Global.canHaveHasekaLatest;
    routeHidden = true;

    constructor(
      public userService: UserService,
      private router: Router,
      private documentViewerFacade: DocumentViewerFacade
      ) { }

    ngOnInit() {
      if (this.allowHasekaLatest.some(this.router.url.includes.bind(this.router.url))) {
        this.routeHidden = false;
      } else {
        this.routeHidden = true;
      }
    }
    

    trackByLabel(index, link) {
      return link.label;
    }

    showDocumentViewer(document: Document) {
      this.documentViewerFacade.showDocument({document, own: true});
    }
}
