import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-nafi-instructions',
  templateUrl: './nafi-instructions.component.html',
  styleUrls: ['./nafi-instructions.component.css']
})
export class NafiInstructionsComponent implements OnInit {

  constructor(public translate: TranslateService) { }

  ngOnInit() {
  }

}
