import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentFormComponent } from '@laji-form/document-form/document-form.component';
import { ComponentCanDeactivate } from '../../../shared/guards/document-de-activate.guard';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { FormService } from '../../../shared/service/form.service';
import { Global } from '../../../../environments/global';
import { ThemeFormComponent } from 'app/+theme/common/theme-form.component';

@Component({
  selector: 'laji-wbc-form',
  templateUrl: './../../common/theme-form.component.html'
})
export class WbcFormComponent
       extends ThemeFormComponent
       implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId;
  documentId;
  hasNS = false;
  private subParam: Subscription;

  onSuccessUrl = '/theme/talvilintulaskenta/ownSubmissions';
  onTmlLoadUrl = '/theme/talvilintulaskenta/form/';
  onMissingNamedPlaceUrl = this.onTmlLoadUrl;
  onErrorUrl = '/theme/talvilintulaskenta/stats';
  onCancelUrl = this.onErrorUrl;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected localizeRouterService: LocalizeRouterService,
    private formService: FormService
  ) {
    super(route, router, localizeRouterService);
  }

  ngOnInit() {
    this.formId = environment.wbcForm;
    this.subParam = this.route.params.subscribe(params => {
      this.documentId = params['id'] || null;
      if (!this.formService.hasNamedPlace() && !this.documentId) {
        this.router.navigate(
          this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/places', Global.collections.wbc, environment.wbcForm])
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
}
