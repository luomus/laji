import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'laji-nafi-form',
  templateUrl: './nafi-form.component.html',
  styleUrls: ['./nafi-form.component.css']
})
export class NafiFormComponent implements OnInit {

  formId;

  constructor() { }

  ngOnInit() {
    this.formId = environment.nafiForm;
  }

}
