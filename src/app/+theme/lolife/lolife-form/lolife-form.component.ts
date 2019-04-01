import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentFormComponent } from '@laji-form/document-form/document-form.component';
import { ComponentCanDeactivate } from '../../../shared/guards/document-de-activate.guard';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { FormService } from '../../../shared/service/form.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeFormComponent } from 'app/+theme/common/theme-form.component';
import { NamedPlacesService } from 'app/shared-modules/named-place/named-places.service';

@Component({
  selector: 'laji-lolife-form',
  templateUrl: './../../common/theme-form.component.html'
})
export class LolifeFormComponent
       extends ThemeFormComponent
       implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId;
  documentId;
  hasNS = false;
  private subParam: Subscription;

  onSuccessUrl = '/theme/lolife/places/HR.2951/'
               + environment.lolifeForm;
  onTmlLoadUrl = '/theme/lolife/form/';
  onMissingNamedPlaceUrl = this.onSuccessUrl;
  onErrorUrl = this.onSuccessUrl;
  onCancelUrl = this.onSuccessUrl;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected localizeRouterService: LocalizeRouterService,
    private formService: FormService,
    private toastService: ToastsService,
    private translateService: TranslateService,
    private namedplacesService: NamedPlacesService
  ) {
    super(route, router, localizeRouterService);
  }

  ngOnInit() {
    this.formId = environment.lolifeForm;
    this.subParam = this.route.params.subscribe(params => {
      this.documentId = params['id'] || null;
      if (!this.formService.hasNamedPlace() && !this.documentId) {
        this.router.navigate(
          this.localizeRouterService.translateRoute(['/theme/lolife/places/HR.2951', environment.lolifeForm]),
          { replaceUrl: true }
        );
      } else {
        this.hasNS = true;
      }
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
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
          this.localizeRouterService.translateRoute(['/theme/lolife']),
          { replaceUrl: true }
        );
      });
  }

  onSuccess(event) {
    this.namedplacesService.getNamedPlace(event.document.namedPlaceID)
    .subscribe((np) => {
      super.navigate([this.onSuccessUrl],
                     {queryParams: {activeNP: event.document.namedPlaceID,
                      municipality: np.municipality}});
    });
  }
}
