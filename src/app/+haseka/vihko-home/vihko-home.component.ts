import { Component, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/* tslint:disable:component-selector */
@Component({
  selector: 'vihko-home',
  templateUrl: './vihko-home.component.html',
  styleUrls: ['./vihko-home.component.scss']
})
export class VihkoHomeComponent implements OnInit {

  currentLang: string;

  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.currentLang = this.translate.currentLang;
  }

}
