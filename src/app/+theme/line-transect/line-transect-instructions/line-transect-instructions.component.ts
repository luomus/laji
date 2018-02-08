import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-line-transect-instructions',
  templateUrl: './line-transect-instructions.component.html',
  styleUrls: ['./line-transect-instructions.component.css']
})
export class LineTransectInstructionsComponent implements OnInit {

  constructor(public translate: TranslateService) { }

  ngOnInit() {
  }

}
