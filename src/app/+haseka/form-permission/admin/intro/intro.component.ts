import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { flatMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'laji-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  form: any;
  loaded = false;

  constructor(private route: ActivatedRoute,
              private formService: FormService,
              private translate: TranslateService
  ) { }

  ngOnInit() {
  const collectionId = this.route.snapshot.params['collectionId'];
  this.formService.getAllForms(this.translate.currentLang)
    .pipe(flatMap(forms => {
      const form = forms.find(f => f.collectionID === collectionId);
      return form ? this.formService.getForm(form.id, this.translate.currentLang) : of(undefined);
    }))
    .subscribe(form => {
      this.form = form;
      this.loaded = true;
    });
  }

}
