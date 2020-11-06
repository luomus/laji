import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit {

  @LocalStorage() public showTemplateIntro;

  constructor() { }

  ngOnInit() {
    if (this.showTemplateIntro === null) {
      this.showTemplateIntro = true;
    }
  }

  toggleInfo() {
    this.showTemplateIntro = !this.showTemplateIntro;
  }

}
