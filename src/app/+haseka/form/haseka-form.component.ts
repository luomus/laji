import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';
import { ComponentCanDeactivate } from '../../shared/guards/document-de-activate.guard';
import { DocumentFormComponent } from '../../shared-modules/laji-form/document-form/document-form.component';
import { LocalizeRouterService } from '../../locale/localize-router.service';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  styleUrls: ['./haseka-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(DocumentFormComponent) documentForm: DocumentFormComponent;
  public formId: string;
  public documentId: string;

  private subParam: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private footerService: FooterService,
              private localizeRouterService: LocalizeRouterService,
              private cd: ChangeDetectorRef,
              public translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subParam = this.route.params.subscribe(params => {
      this.formId = params['formId'];
      this.documentId = params['documentId'] || null;
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
    this.footerService.footerVisible = true;
  }

  canDeactivate() {
    if (!this.documentForm) {
      return true;
    }
    return this.documentForm.canDeactivate();
  }

  onSuccess(data) {
    if (data.form && data.form.viewerType && data.document && data.document.id) {
      return this.router.navigate(
        this.localizeRouterService.translateRoute(['/vihko/statistics/', data.document.id])
      );
    }
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/vihko/'])
    );
  }

  onTmlLoad(data) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/vihko', data.formID, data.tmpID]),
      { replaceUrl: true }
    );
  }

  onAccessDenied(collectionID) {
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko/fp', collectionID]));
  }

  onMissingNamedplace(data) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/vihko/places/' + data.collectionID + '/' + data.formID])
    );
  }

  onError() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']));
  }

  onCancel() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']));
  }
}
