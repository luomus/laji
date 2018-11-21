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
import { ThemeFormComponent } from 'app/+theme/common/theme-form.component';
import { NamedPlacesService } from 'app/shared-modules/named-place/named-places.service';

@Component({
  selector: 'laji-invasive-control-form',
  templateUrl: './invasive-control-form.component.html',
  styleUrls: ['./invasive-control-form.component.css']
})
export class InvasiveControlFormComponent
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
    private translateService: TranslateService,
    private namedplacesService: NamedPlacesService
  ) {
    super(route, router, localizeRouterService);
  }

  ngOnInit() {
    this.formId = environment.invasiveControlForm;
    this.subParam = this.route.params.subscribe(params => {
      this.documentId = params['id'] || null;
      if (!this.formService.hasNamedPlace() && !this.documentId) {
        this.router.navigate(
          this.localizeRouterService.translateRoute(['/theme/vieraslajit/places/HR.2049', environment.invasiveControlForm]),
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
    super.onTmlLoad(data, '/theme/vieraslajit/form/');
  }

  onMissingNamedplace() {
    super.onMissingNamedplace('/theme/vieraslajit/places/HR.2049/'
                              + environment.invasiveControlForm);
  }

  onAccessDenied() {
    this.translateService.get('form.permission.no-access')
      .subscribe(msg => {
        this.toastService.showWarning(msg);
        this.router.navigate(
          this.localizeRouterService.translateRoute(['/theme/vieraslajit']),
          { replaceUrl: true }
        );
      });
  }
  onSuccess(event) {
    this.namedplacesService.getNamedPlace(event.document.namedPlaceID)
    .subscribe((np) => {
      super.onSuccess('/theme/vieraslajit/places/HR.2049/'
                      + environment.invasiveControlForm,
                      {activeNP: event.document.namedPlaceID,
                       municipality: np.municipality});
    });
  }

  onError() {
    super.onError('/theme/vieraslajit/places/HR.2049/'
                   + environment.invasiveControlForm);
  }

  onCancel() {
    super.onCancel('/theme/vieraslajit/places/HR.2049/'
                    + environment.invasiveControlForm);
  }
}
