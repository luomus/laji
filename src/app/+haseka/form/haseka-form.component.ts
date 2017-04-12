import { animate, Component, OnDestroy, OnInit, state, style, transition, trigger, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';
import { LajiFormComponent } from '../../shared/form/laji-form.component';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  styleUrls: ['./haseka-form.component.css'],
  animations: [
    trigger('visibilityChanged', [
      state('shown' , style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('shown => hidden', animate('600ms')),
      transition('hidden => shown', animate('300ms'))
    ])
  ]
})
export class HaSeKaFormComponent implements OnInit, OnDestroy {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;

  public formId: string;
  public documentId: string;

  private subParam: Subscription;

  constructor(private route: ActivatedRoute,
              private footerService: FooterService,
              public translate: TranslateService,) {
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

}
