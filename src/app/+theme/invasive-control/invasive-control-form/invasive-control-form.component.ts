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

@Component({
  selector: 'laji-invasive-control-form',
  templateUrl: './invasive-control-form.component.html',
  styleUrls: ['./invasive-control-form.component.css']
})
export class InvasiveControlFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId;
  documentId;
  hasNS = false;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private formService: FormService,
    private toastService: ToastsService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.formId = environment.invasiveControlForm;
    this.subParam = this.route.params.subscribe(params => {
      this.documentId = params['id'] || null;
      if (!this.formService.hasNamedPlace() && !this.documentId) {
        this.router.navigate(
          this.localizeRouterService.translateRoute(['/theme/vieraslajit/places/HR.2049', environment.invasiveControlForm),
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
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/theme/vieraslajit/form/', data.tmpID]),
      { replaceUrl: true }
    );
  }

  onMissingNamedplace(data) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/theme/vieraslajit/form']),
      { replaceUrl: true }
    );
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
  onSuccess(data) {
    console.warn('invasive control form onSuccess TODO');
    // TODO Doesn't exist yet
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/vieraslajit/ownSubmissions']));
  }

  onError() {
    console.warn('invasive control form onError TODO');
    // TODO Doesn't exist yet
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/vieraslajit/stats']));
  }

  onCancel() {
    console.warn('invasive control form onCancel TODO');
    // TODO Doesn't exist yet
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/vieraslajit/stats']));
  }
}
