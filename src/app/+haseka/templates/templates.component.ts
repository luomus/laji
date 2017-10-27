import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LocalStorage } from 'ng2-webstorage';

@Component({
  selector: 'laji-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit {

  @LocalStorage() public showTemplateIntro;

  constructor() { }

  ngOnInit() {
    console.log(this.showTemplateIntro);
    if (this.showTemplateIntro === null) {
      this.showTemplateIntro = true;
    }
  }

  toggleInfo() {
    this.showTemplateIntro = !this.showTemplateIntro;
  }

}
