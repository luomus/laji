import { Component, OnInit } from '@angular/core';
import { Global } from '../../environments/global';
import { HeaderService } from '../../app/shared/service/header.service'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit {

  Global = Global;

  constructor(
    private headerService: HeaderService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.headerService.updateMetaDescription(this.translateService.instant('theme.intro'));
  }

}
