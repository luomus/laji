import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'laji-wbc-own-submissions',
  templateUrl: './wbc-own-submissions.component.html',
  styleUrls: ['./wbc-own-submissions.component.css']
})
export class WbcOwnSubmissionsComponent implements OnInit {

  formId: string;

  constructor() {
    this.formId = environment.wbcForm;
  }

  ngOnInit() {
  }

}
