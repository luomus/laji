import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'laji-theme-form',
  templateUrl: './form.component.html'
})
export class FormComponent
  implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId;
  form: any;
  collectionId;
  documentId;
  hasNS = false;
  private subParam: Subscription;
  private onSuccessNav$: Subscription;

  routeFormID: string;
  root: string;
  successPage: string;
  onSuccessUrl: string;
  onTmlLoadUrl: string;
  _onAccessDenied: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private formService: FormService,
    private toastService: ToastsService,
    private translateService: TranslateService,
    private namedplacesService: NamedPlacesService,
    private themeFormService: ThemeFormService
  ) {

  }

  ngOnInit() {
    this.subParam = this.route.params.pipe(
      mergeMap((params: Params) => this.route.parent.data.pipe(
        switchMap(({formID}) => {
          this.routeFormID = params['formID'];
          return this.formService.getForm(this.routeFormID || formID, this.translateService.currentLang);
        }),
        switchMap(form => this.themeFormService.getNavLinks$(this.route.parent).pipe(
          map(navLinks => ({form, params, navLinks})
          )))
      ))
    ).subscribe(({form, params, navLinks}) => {
      this.form = form;
      this.formId = form.id;
      this.collectionId = form.collectionID;
      const navLinkNames = navLinks.reduce((names, {name}) => ({
        ...names,
        [name]: true
      }), {});

      // Assumes that we are on a theme subpage (e.g. /theme/vieraslajit/*).
      this.root = this.router.url.replace(/(^.*\/theme\/[^\/]*)\/.*/, '$1');
      this.successPage = (['stats', 'ownSubmissions', 'form'].find(navPage => navLinkNames[navPage])
       || '');
      this.onSuccessUrl = this.root + '/'
        + this.successPage
        + ((this.successPage === 'form' && this.routeFormID)
          ? `/${this.routeFormID}`
          : '');
      this.onTmlLoadUrl = this.routeFormID ? `${this.root}/form/${this.routeFormID}`
      : `${this.root}/form`;
      this._onAccessDenied = this.root;

      this.documentId = params['id'] || null;
      if (form.features.indexOf(Form.Feature.NamedPlace) === -1) {
        this.hasNS = true;
        return;
      }
      if (!this.formService.hasNamedPlace() && !this.documentId) {
        this.navigateAfterForm();
      } else {
        this.hasNS = true;
      }
    });
  }

  navigateAfterForm() {
    const query = this.form.features.indexOf(Form.Feature.NamedPlace) === -1
      ? this.routeFormID
        ? [this.root, 'form', this.routeFormID]
        : [this.root, 'form']
      : [this.root, 'places', this.collectionId, this.formId];
    this.router.navigate(
      this.localizeRouterService.translateRoute(query),
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
    this.translateService.get('form.permission.no-access')
      .subscribe(msg => {
        this.toastService.showWarning(msg);
        this.router.navigate(
          this.localizeRouterService.translateRoute([this._onAccessDenied]),
          { replaceUrl: true, relativeTo: this.route }
        );
      });
  }

  protected navigate(route: any[], extras?: NavigationExtras) {
    return this.router.navigate(
      this.localizeRouterService.translateRoute(route), extras
    );
  }

  onSuccess(event) {
    if (this.form.features.indexOf('MHL.featureNamedPlace') === -1) {
      this.navigate([this.onSuccessUrl], {relativeTo: this.route});
      return;
    }
    this.onSuccessNav$ = this.namedplacesService.getNamedPlace(event.document.namedPlaceID)
      .subscribe((np) => {
        let queryParams;
        if (this.successPage === 'form') {
          queryParams = {
            activeNP: event.document.namedPlaceID,
          };

          if (this.form.features.indexOf(Form.Feature.FilterNamedPlacesByMunicipality)) {
            queryParams.municipality = np.municipality instanceof Array ? np.municipality[0] : 'all';
          }
          if (this.form.features.indexOf(Form.Feature.FilterNamedPlacesByBirdAssociationArea)
            && np.birdAssociationArea instanceof Array
          ) {
            queryParams.birdAssociationArea = np.birdAssociationArea[0];
          }
        }
        this.navigate([this.onSuccessUrl],
          {
            relativeTo: this.route.parent,
            queryParams
          });
      });
  }

  onError() {
    this.navigateAfterForm();
  }

  onCancel() {
    this.navigateAfterForm();
  }

  onMissingNamedplace() {
    this.navigateAfterForm();
  }

  onTmlLoad(data) {
    this.navigate(
      [this.onTmlLoadUrl, data.tmpID],
      { replaceUrl: true, relativeTo: this.route }
    );
  }
}

