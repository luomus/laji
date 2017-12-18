import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: '[laji-wbc]',
  templateUrl: './wbc.component.html',
  styleUrls: ['./wbc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WbcComponent implements OnInit {

  showForm =  false;
  isFormPage = false;

  constructor(public router: Router) {}

  ngOnInit() {
    this.showForm = !environment.production;
  }

  showNavigation() {
    console.log(this.router.url);
    return this.router.url.indexOf('form') === -1;
  }
}
