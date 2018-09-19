import { Component, OnInit } from '@angular/core';
import { IucnService } from '../iucn-shared/service/iucn.service';

@Component({
  selector: 'laji-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public iucnService: IucnService) { }

  ngOnInit() {
  }

}
