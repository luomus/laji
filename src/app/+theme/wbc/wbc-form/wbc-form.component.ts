import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentFormComponent } from '../../../shared/document-form/document-form.component';
import { ComponentCanDeactivate } from '../../../shared/document-form/document-de-activate.guard';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { FormService } from '../../../shared/service/form.service';

@Component({
  selector: 'laji-wbc-form',
  templateUrl: './wbc-form.component.html',
  styleUrls: ['./wbc-form.component.css']
})
export class WbcFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
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
    this.formId = environment.wbcForm;
    this.subParam = this.route.params.subscribe(params => {
      this.documentId = params['id'] || null;
      if (!this.formService.hasNamedPlace() && !this.documentId) {
        this.router.navigate(
          this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/places/HR.39', environment.wbcForm])
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
      this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/form/', data.tmpID]),
      { replaceUrl: true }
    );
  }

  onSuccess(data) {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/ownSubmissions']));
  }

  onError() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/stats']));
  }

  onCancel() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/stats']));
  }

  onMissingNamedplace(data) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/form']),
      { replaceUrl: true }
    );
  }
}
