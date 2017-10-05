import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: '[laji-wbc]',
  templateUrl: './wbc.component.html',
  styleUrls: ['./wbc.component.css']
})
export class WbcComponent implements OnInit {

  showForm =  false;
  isFormPage = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.showForm = !environment.production;
  }
}
