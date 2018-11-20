import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentFormComponent } from '@laji-form/document-form/document-form.component';
import { ComponentCanDeactivate } from '../../../shared/guards/document-de-activate.guard';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { ThemeFormComponent } from 'app/+theme/common/theme-form.component';

@Component({
  selector: 'laji-nafi-form',
  templateUrl: './nafi-form.component.html',
  styleUrls: ['./nafi-form.component.css']
})
export class NafiFormComponent
       extends ThemeFormComponent
       implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  formId;
  documentId;
  private subParam: Subscription;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected localizeRouterService: LocalizeRouterService,
  ) {
    super(route, router, localizeRouterService)
  }

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
    super.onTmlLoad(data, '/theme/nafi/form/');
  }

  onSuccess() {
    super.onSuccess('/theme/nafi/ownSubmissions');
  }

  onError() {
    super.onError('/theme/nafi/stats');
  }

  onCancel() {
    super.onCancel('/theme/nafi/stats');
  }
}
