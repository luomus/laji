import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';
import { ComponentCanDeactivate } from '../../shared/document-form/document-de-activate.guard';
import { ViewChild } from '@angular/core';
import { DocumentFormComponent } from '../../shared/document-form/document-form.component';
import { DialogService } from '../../shared/service/dialog.service';
import { FormService } from '../../shared/service/form.service';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  styleUrls: ['./haseka-form.component.css']
})
export class HaSeKaFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  public formId: string;
  public documentId: string;

  private subParam: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private footerService: FooterService,
              private dialogService: DialogService,
              private formService: FormService,
              public translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subParam = this.route.params.subscribe(params => {
      this.formId = params['formId'];
      this.documentId = params['documentId'] || null;
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
    this.footerService.footerVisible = true;
  }

  canDeactivate() {
    if (!this.documentForm || !this.documentForm.hasChanges) {
      this.formService.discard(undefined, true);
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

  onSuccess(data) {
    if (data.form && data.form.viewerType && data.document && data.document.id) {
      return this.router.navigate(['/vihko/statistics/', data.document.id]);
    }
    this.router.navigate(['/vihko/']);
  }

  onTmlLoad(data) {
    this.router.navigate(
      ['/vihko', data.formID, data.tmpID],
      { replaceUrl: true }
    );
  }

  onError() {
    this.router.navigate(['/vihko']);
  }

  onCancel() {
    this.router.navigate(['/vihko']);
  }
}
