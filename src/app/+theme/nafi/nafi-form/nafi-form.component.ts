import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../../shared/service/form.service';
import { ViewChild } from '@angular/core';
import { DocumentFormComponent } from '../../../shared/document-form/document-form.component';
import { DialogService } from '../../../shared/service/dialog.service';
import { ComponentCanDeactivate } from '../../../shared/document-form/document-de-activate.guard';

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
    private translate: TranslateService,
    private formService: FormService,
    private dialogService: DialogService
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
    if (!this.documentForm || !this.documentForm.hasChanges) {
      return true;
    }
    return this.translate
      .get('haseka.form.discardConfirm')
      .switchMap(txt => this.dialogService.confirm(txt))
      .do((result) => {
        if (result) {
          this.formService.discard();
        }
      });
  }

  onTmlLoad(data) {
    this.router.navigate(
      ['/theme/nafi/form/', data.tmpID],
      { replaceUrl: true }
    );
  }

  onSuccess(data) {
    this.router.navigate(['/theme/nafi/stats']);
  }

  onError() {
    this.router.navigate(['/theme/nafi/stats']);
  }

  onCancel() {
    this.router.navigate(['/theme/nafi/stats']);
  }
}
