import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';
import { ComponentCanDeactivate } from '../../shared/guards/document-de-activate.guard';
import { DocumentFormComponent } from '@laji-form/document-form/document-form.component';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { RoutingStateService } from '../../shared/service/routing-state.service';
import { FormService } from '../../shared/service/form.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { Form } from '../../shared/model/Form';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  styleUrls: ['./haseka-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId: string;
  documentId: string;
  back: string;
  showMobileEntryPage$: Observable<boolean>;
  form$: Observable<any>;
  isMobile$: Observable<boolean>;
  mobileWelcomePageClosed = false;

  private subParam: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private footerService: FooterService,
              private localizeRouterService: LocalizeRouterService,
              private cd: ChangeDetectorRef,
              private routingStateService: RoutingStateService,
              private formService: FormService,
              public translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.back = this.getBack();
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
    this.showMobileEntryPage$ = this.route.params.pipe(
      switchMap(params => params['documentId']
        ? of(false)
        : this.isMobile$
      )
    );
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
    if (data.form && data.form.viewerType && data.document && data.document.id) {
      return this.router.navigate(
        this.localizeRouterService.translateRoute(['/vihko/statistics/', data.document.id])
      );
    }
    if (this.back) {
      return this.router.navigateByUrl(this.back);
    }
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko/']));
  }

  onTmlLoad(data) {
    this.routingStateService.removeLast();
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/vihko', data.formID, data.tmpID]),
      { replaceUrl: true, skipLocationChange: true }
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
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']));
  }

  onCancel() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']));
  }

  private getBack() {
    const history = this.routingStateService.getHistory();
    for (let i = history.length - 2; i >= 0; i--) {
      if (history[i].match(/\/user/)) {
        continue;
      }
      return history[i];
    }
    return '';
  }

  enterForm() {
    this.mobileWelcomePageClosed = true;
  }
}
