import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'laji-line-transect-my-document-list',
  templateUrl: './line-transect-my-document-list.component.html',
  styleUrls: ['./line-transect-my-document-list.component.css']
})
export class LineTransectMyDocumentListComponent implements OnInit {

  formId: string;

  constructor() {
    this.formId = environment.lineTransectForm;
  }

  ngOnInit() {
  }

}
