import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: '[laji-wbc]',
  templateUrl: './wbc.component.html',
  styleUrls: ['./wbc.component.css']
})
export class WbcComponent implements OnInit {

  showForm =  false;

  constructor() { }

  ngOnInit() {
    this.showForm = !environment.production;
  }
}
