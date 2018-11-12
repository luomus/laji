import { Component, OnInit } from '@angular/core';
import { ResultService } from '../iucn-shared/service/result.service';

@Component({
  selector: 'laji-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public iucnService: ResultService) { }

  ngOnInit() {
  }

}
