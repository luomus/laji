import { filter, map, startWith } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Document } from '../shared/model/Document';
import { DocumentViewerFacade } from '../shared-modules/document-viewer/document-viewer.facade';
import { getDescription, HeaderService } from '../shared/service/header.service';
import { TranslateService } from '@ngx-translate/core';

/* tslint:disable:component-selector */
@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.scss']
})
export class HasekaComponent implements OnInit, OnDestroy {

  public email: string;
  public isFront = false;
  public publicity = Document.PublicityRestrictionsEnum;

  private subRoute: Subscription;

  constructor(
    public userService: UserService,
    public router: Router,
    private documentViewerFacade: DocumentViewerFacade,
    private headerService: HeaderService,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.subRoute = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => true),
      startWith(true)
    ).subscribe(() => {
      this.isFront = this.router.isActive('/vihko/home', true);
    });

    this.headerService.setHeaders({
      description: getDescription(this.translate.instant('haseka.intro'))
    });
  }

  ngOnDestroy() {
    if (this.subRoute) {
      this.subRoute.unsubscribe();
    }
  }

  showDocumentViewer(document: Document) {
    this.documentViewerFacade.showDocument({document, own: true});
  }
}
