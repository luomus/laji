import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription, merge, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';
import { ComponentCanDeactivate } from '../../shared/guards/document-de-activate.guard';
import { DocumentFormComponent } from '@laji-form/document-form/document-form.component';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { FormService } from '../../shared/service/form.service';
import { map, switchMap } from 'rxjs/operators';
import { Form } from '../../shared/model/Form';
import { take } from 'rxjs/internal/operators';
import { BrowserService } from '../../shared/service/browser.service';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  styleUrls: ['./haseka-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent, { static: false }) documentForm: DocumentFormComponent;
  formId: string;
  documentId: string;
  showMobileEntryPage$: Observable<boolean>;
  form$: Observable<any>;
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
              public translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subParam = this.route.params.subscribe(params => {
      this.formId = params['formId'];
      this.documentId = params['documentId'] || null;
      this.cd.markForCheck();
    });
    this.form$ = this.route.params.pipe(
      switchMap(params => this.formService.getForm(params['formId'], this.translate.currentLang))
    );
    this.isMobile$ = this.form$.pipe(
      map(form => form.features && form.features.indexOf(Form.Feature.Mobile) !== -1)
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
    this.browserService.goBack(() => {
      if (data.form && data.form.viewerType && data.document && data.document.id) {
        return this.router.navigate(
          this.localizeRouterService.translateRoute(['/vihko/statistics/', data.document.id])
        );
      }
      this.isMobile$.pipe(take(1)).subscribe(isMobile => {
        const query = isMobile ? ['/vihko', this.formId] : ['/vihko'];
        this.router.navigate(this.localizeRouterService.translateRoute(query));
      });
    });
  }

  private navigateToFront() {
    this.browserService.goBack(() => {
      this.isMobile$.pipe(take(1)).subscribe(isMobile => {
        const query = isMobile ? ['/vihko', this.formId] : ['/vihko'];
        this.router.navigate(this.localizeRouterService.translateRoute(query));
      });
    });
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
}
