import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-wbc-instructions',
  templateUrl: './wbc-instructions.component.html',
  styleUrls: ['./wbc-instructions.component.css']
})
export class WbcInstructionsComponent implements OnInit {

  constructor(public translate: TranslateService) { }

  ngOnInit() {
  }

}
