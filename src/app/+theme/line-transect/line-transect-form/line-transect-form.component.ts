import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentFormComponent } from '@laji-form/document-form/document-form.component';
import { ComponentCanDeactivate } from '../../../shared/guards/document-de-activate.guard';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { FormService } from '../../../shared/service/form.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { Global } from '../../../../environments/global';
import { ThemeFormComponent } from 'app/+theme/common/theme-form.component';

@Component({
  selector: 'laji-line-transect-form',
  templateUrl: './line-transect-form.component.html',
  styleUrls: ['./line-transect-form.component.css']
})
export class LineTransectFormComponent
       extends ThemeFormComponent
       implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId;
  documentId;
  hasNS = false;
  private subParam: Subscription;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected localizeRouterService: LocalizeRouterService,
    private formService: FormService,
    private toastService: ToastsService,
    private translateService: TranslateService
  ) {
    super(route, router, localizeRouterService);
  }

  ngOnInit() {
    this.formId = environment.lineTransectForm;
    this.subParam = this.route.params.subscribe(params => {
      this.documentId = params['id'] || null;
      if (!this.formService.hasNamedPlace() && !this.documentId) {
        this.router.navigate(
          this.localizeRouterService.translateRoute([
            '/theme/linjalaskenta/places',
            Global.collections.lineTransect,
            environment.lineTransectForm
          ]),
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

  onTmlLoad(data) {
    super.onTmlLoad(data, '/theme/linjalaskenta/form/');
  }

  onSuccess() {
    super.onSuccess('/theme/linjalaskenta/statistics');
  }

  onError() {
    super.onError('/theme/linjalaskenta/stats');
  }

  onCancel() {
    super.onCancel('/theme/linjalaskenta/stats');
  }

  onMissingNamedplace() {
    super.onMissingNamedplace('/theme/linjalaskenta/form');
  }

  onAccessDenied() {
    this.translateService.get('form.permission.no-access')
      .subscribe(msg => {
        this.toastService.showWarning(msg);
        this.router.navigate(
          this.localizeRouterService.translateRoute(['/theme/linjalaskenta']),
          { replaceUrl: true }
        );
      });
  }
}
