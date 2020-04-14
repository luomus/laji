import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { DocumentFormComponent } from '@laji-form/document-form/document-form.component';
import { ComponentCanDeactivate } from '../../../shared/guards/document-de-activate.guard';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { FormService } from '../../../shared/service/form.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { NamedPlacesService } from 'app/shared-modules/named-place/named-places.service';
import { ThemeFormService } from '../theme-form.service';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { Form } from '../../../shared/model/Form';
import { LajiFormDocumentFacade } from '@laji-form/laji-form-document.facade';
import { BrowserService } from '../../../shared/service/browser.service';

@Component({
  selector: 'laji-theme-form',
  templateUrl: './form.component.html'
})
export class FormComponent
  implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent, { static: false }) documentForm: DocumentFormComponent;
  formId;
  form: any;
  collectionId;
  documentId;
  private subParam: Subscription;
  private onSuccessNav$: Subscription;

  routeFormID: string;
  root: string;
  successPage: string;
  onSuccessUrl: string;
  _onAccessDenied: string;

  constructor(
    private formFacade: LajiFormDocumentFacade,
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private formService: FormService,
    private toastService: ToastsService,
    private translateService: TranslateService,
    private namedplacesService: NamedPlacesService,
    private themeFormService: ThemeFormService,
    private browserService: BrowserService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    const parentRoute = this.route.parent;
    this.subParam = this.route.params.pipe(
      mergeMap((params: Params) => parentRoute.data.pipe(
        switchMap(({formID}) => {
          this.routeFormID = params['formID'] || parentRoute.snapshot.params['formID'] || formID;
          return this.formService.getForm(this.routeFormID, this.translateService.currentLang);
        }),
        switchMap(form => this.themeFormService.getNavLinks$(this.route.parent).pipe(
          map(navLinks => ({form, params, navLinks}))
        ))
      ))
    ).subscribe(({form, params, navLinks}) => {
      this.form = form;
      this.formId = form.id;
      this.collectionId = form.collectionID;
      const navLinkNames = navLinks.reduce((names, {name}) => ({...names, [name]: true}), {});

      // Assumes that we are on a theme subpage (e.g. /theme/vieraslajit/*).
      this.root = this.router.url.replace(/(^.*\/theme\/[^\/]*)\/.*/, '$1');
      this.successPage = (['stats', 'ownSubmissions', 'form'].find(navPage => navLinkNames[navPage])
       || '');
      this.onSuccessUrl = this.root + '/'
        + this.successPage
        + ((this.successPage === 'form' && this.routeFormID)
          ? `/${this.routeFormID}`
          : '');
      this._onAccessDenied = this.root;
      this.documentId = params['id'] || null;
      this.cdr.markForCheck();
    });
  }

  navigateAfterForm() {
    const query = this.form.features.indexOf(Form.Feature.NamedPlace) === -1
      ? this.routeFormID
        ? [this.root, 'form', this.routeFormID]
        : [this.onSuccessUrl]
      : [this.root, 'places', this.collectionId, this.formId];
    this.router.navigate(
      query,
      {replaceUrl: true, relativeTo: this.route}
    );
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
    if (this.onSuccessNav$) {
      this.onSuccessNav$.unsubscribe();
    }
  }

  canDeactivate() {
    if (!this.documentForm) {
      return true;
    }
    return this.documentForm.canDeactivate();
  }

  onAccessDenied() {
    this.toastService.showWarning(this.translateService.instant('form.permission.no-access'));
    this.router.navigate(
      this.localizeRouterService.translateRoute([this._onAccessDenied]),
      { replaceUrl: true, relativeTo: this.route }
    );
  }

  protected navigate(route: any[], extras?: NavigationExtras) {
    return this.router.navigate(
      this.localizeRouterService.translateRoute(route), extras
    );
  }

  onSuccess(event) {
    this.browserService.goBack(() => {
      if (!FormService.hasFeature(this.form, Form.Feature.NamedPlace)) {
        this.navigate([this.onSuccessUrl], {relativeTo: this.route});
        return;
      }
      if (FormService.hasFeature(this.form, Form.Feature.FilterNamedPlacesByBirdAssociationArea)) {
        this.navigate([this.onSuccessUrl], {relativeTo: this.route.parent, queryParams: this.extractQueryParams(event, {})});
        return;
      }
      this.onSuccessNav$ = this.namedplacesService.getNamedPlace(event.document.namedPlaceID)
        .subscribe((np) => {
          this.navigate([this.onSuccessUrl], {relativeTo: this.route.parent, queryParams: this.extractQueryParams(event, np)});
        });
    });
  }

  onError() {
    this.browserService.goBack(() => this.navigateAfterForm());
  }

  onCancel() {
    this.browserService.goBack(() => this.navigateAfterForm());
  }

  onMissingNamedplace() {
    this.navigateAfterForm();
  }

  private extractQueryParams(event, np) {
    if (this.successPage !== 'form') {
      return;
    }

    const queryParams: any = {
      activeNP: event.document.namedPlaceID,
    };

    if (FormService.hasFeature(this.form, Form.Feature.FilterNamedPlacesByBirdAssociationArea)) {
      queryParams.municipality = np.municipality instanceof Array ? np.municipality[0] : 'all';
    }
    if (FormService.hasFeature(this.form, Form.Feature.FilterNamedPlacesByBirdAssociationArea)
      && np.birdAssociationArea instanceof Array
    ) {
      queryParams.birdAssociationArea = np.birdAssociationArea[0];
    }
    return queryParams;
  }
}

