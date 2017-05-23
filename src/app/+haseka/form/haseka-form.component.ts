import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  styleUrls: ['./haseka-form.component.css']
})
export class HaSeKaFormComponent implements OnInit, OnDestroy {
  public formId: string;
  public documentId: string;

  private subParam: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private footerService: FooterService,
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
