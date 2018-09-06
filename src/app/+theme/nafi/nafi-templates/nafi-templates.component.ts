import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'laji-nafi-templates',
  templateUrl: './nafi-templates.component.html',
  styleUrls: ['./nafi-templates.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiTemplatesComponent implements OnInit {

  formId: string;

  @LocalStorage() public showTemplateIntro;

  constructor() {
    this.formId = environment.nafiForm;
  }

  ngOnInit() {
    if (this.showTemplateIntro === null) {
      this.showTemplateIntro = true;
    }
  }

  toggleInfo() {
    this.showTemplateIntro = !this.showTemplateIntro;
  }

}

