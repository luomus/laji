import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'laji-nafi-form',
  templateUrl: './nafi-form.component.html',
  styleUrls: ['./nafi-form.component.css']
})
export class NafiFormComponent implements OnInit, OnDestroy {

  formId;
  documentId;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router
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
