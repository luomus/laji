import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-nafi-templates',
  templateUrl: './nafi-templates.component.html',
  styleUrls: ['./nafi-templates.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiTemplatesComponent implements OnInit {

  collectionID = Global.collections.nafi;

  @LocalStorage() public showTemplateIntro;

  ngOnInit() {
    if (this.showTemplateIntro === null) {
      this.showTemplateIntro = true;
    }
  }

  toggleInfo() {
    this.showTemplateIntro = !this.showTemplateIntro;
  }

}

