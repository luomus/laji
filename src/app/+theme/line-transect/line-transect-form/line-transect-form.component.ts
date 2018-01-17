import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentFormComponent } from '../../../shared/document-form/document-form.component';
import { ComponentCanDeactivate } from '../../../shared/document-form/document-de-activate.guard';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { FormService } from '../../../shared/service/form.service';

@Component({
  selector: 'laji-line-transect-form',
  templateUrl: './line-transect-form.component.html',
  styleUrls: ['./line-transect-form.component.css']
})
export class LineTransectFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId;
  documentId;
  hasNS = false;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private formService: FormService
  ) { }

  ngOnInit() {
    this.formId = environment.lineTransectForm;
    this.subParam = this.route.params.subscribe(params => {
      this.documentId = params['id'] || null;
      if (!this.formService.hasNamedPlace() && !this.documentId) {
        this.router.navigate(
          this.localizeRouterService.translateRoute(['/theme/line-transect/places/HR.61', environment.lineTransectForm])
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
      this.localizeRouterService.translateRoute(['/theme/line-transect/form/', data.tmpID]),
      { replaceUrl: true }
    );
  }

  onSuccess(data) {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/line-transect/statistics', data.document.id]));
  }

  onError() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/line-transect/stats']));
  }

  onCancel() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/line-transect/stats']));
  }

  onMissingNamedplace(data) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/theme/line-transect/form']),
      { replaceUrl: true }
    );
  }
}
