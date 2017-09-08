import { Component, Input, OnInit } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-main-result',
  templateUrl: './main-result.component.html',
  styleUrls: ['./main-result.component.css']
})
export class MainResultComponent implements OnInit {

  @Input() query: WarehouseQueryInterface;

  constructor() { }

  ngOnInit() {
  }

}
