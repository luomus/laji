import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentFormComponent } from '../../../shared/document-form/document-form.component';
import { ComponentCanDeactivate } from '../../../shared/document-form/document-de-activate.guard';
import { LocalizeRouterService } from '../../../locale/localize-router.service';

@Component({
  selector: 'laji-nafi-form',
  templateUrl: './nafi-form.component.html',
  styleUrls: ['./nafi-form.component.css']
})
export class NafiFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId;
  documentId;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
  ) { }

  ngOnInit() {
    this.formId = environment.nafiForm;
    this.subParam = this.route.params.subscribe(params => {
      this.documentId = params['id'] || null;
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
      this.localizeRouterService.translateRoute(['/theme/nafi/form/', data.tmpID]),
      { replaceUrl: true }
    );
  }

  onSuccess(data) {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/nafi/stats']));
  }

  onError() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/nafi/stats']));
  }

  onCancel() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/theme/nafi/stats']));
  }
}
