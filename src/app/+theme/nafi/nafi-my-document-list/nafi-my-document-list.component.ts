import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'laji-nafi-my-document-list',
  templateUrl: './nafi-my-document-list.component.html',
  styleUrls: ['./nafi-my-document-list.component.css']
})
export class NafiMyDocumentListComponent implements OnInit {

  formId: string;

  constructor() {
    this.formId = environment.nafiForm;
  }

  ngOnInit() {
  }

}
