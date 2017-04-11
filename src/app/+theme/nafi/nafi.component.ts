import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: '[laji-nafi]',
  templateUrl: './nafi.component.html',
  styleUrls: ['./nafi.component.css']
})
export class NafiComponent implements OnInit {

  showForm =  false;

  constructor() { }

  ngOnInit() {
    this.showForm = !environment.production;
  }
}
