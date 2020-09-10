import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { merge, Observable, of, Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';
import { ComponentCanDeactivate } from '../../shared/guards/document-de-activate.guard';
import { DocumentFormComponent } from '@laji-form/document-form/document-form.component';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { FormService } from '../../shared/service/form.service';
import { map, take, switchMap } from 'rxjs/operators';
import { Form } from '../../shared/model/Form';
import { BrowserService } from '../../shared/service/browser.service';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';
import { Document } from '../../shared/model/Document';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  styleUrls: ['./haseka-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;

  @Input() template = false;
  @Input() form$: Observable<any>;

  formId: string;
  documentId: string;
  showMobileEntryPage$: Observable<boolean>;
  isMobile$: Observable<boolean>;
  mobileWelcomePageClosed = false;
  _mobileWelcomePageShown: Subject<boolean>;

  private subParam: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private footerService: FooterService,
              private localizeRouterService: LocalizeRouterService,
              private cd: ChangeDetectorRef,
              private formService: FormService,
              private browserService: BrowserService,
              public translate: TranslateService,
              private documentViewerFacade: DocumentViewerFacade
  ) {}

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subParam = this.route.params.subscribe(params => {
      this.formId = params['formId'];
      this.documentId = params['documentId'] || null;
      this.cd.markForCheck();
    });

    if (!this.form$) {
      this.form$ = this.route.params.pipe(
        switchMap(params => this.formService.getForm(params['formId'], this.translate.currentLang))
      );
    }

    this.isMobile$ = this.form$.pipe(
      map(form => FormService.hasFeature(form, Form.Feature.Mobile))
    );
    this._mobileWelcomePageShown = new Subject();
    this.showMobileEntryPage$ = merge(this.route.params.pipe(
      switchMap(params => params['documentId']
        ? of(false)
        : this.isMobile$
      )
    ), this._mobileWelcomePageShown);
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
    this.footerService.footerVisible = true;
  }

  canDeactivate() {
    if (!this.documentForm) {
      return true;
    }
    return this.documentForm.canDeactivate();
  }

  onSuccess(data) {
    this.isMobile$.pipe(take(1)).subscribe(isMobile => {
      if (isMobile) {
        return this.navigateToMobileFront();
      }
      this.browserService.goBack(() => {
        if (data.form && data.form.viewerType && data.document && data.document.id) {
          return this.router.navigate(
            this.localizeRouterService.translateRoute(['/vihko/statistics/', data.document.id])
          );
        }
        this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']));
      });
    });
  }

  private navigateToFront() {
    this.isMobile$.pipe(take(1)).subscribe(isMobile => {
      if (isMobile) {
        return this.navigateToMobileFront();
      }
      this.browserService.goBack(() => this.router.navigate(this.localizeRouterService.translateRoute(['/vihko'])));
    });
  }

  private navigateToMobileFront() {
    return this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']), {skipLocationChange: true}).then(() =>
      this.router.navigate(this.localizeRouterService.translateRoute(['/vihko', this.formId]))
    );
  }

  onAccessDenied(collectionID) {
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko/fp', collectionID]));
  }

  onMissingNamedplace(data) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/vihko/places/' + data.collectionID + '/' + data.formID])
    );
  }

  onError() {
    this.navigateToFront();
  }

  onCancel() {
    this.navigateToFront();
  }

  enterForm() {
    this.mobileWelcomePageClosed = true;
    this._mobileWelcomePageShown.next(false);
  }

  showDocumentViewer(document: Document) {
    this.documentViewerFacade.showDocument({document, own: true});
  }
}
