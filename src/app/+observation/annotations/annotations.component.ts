import { Component, Input, OnInit } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss']
})
export class AnnotationsComponent implements OnInit {

  @Input()
  query: WarehouseQueryInterface;

  constructor() { }

  ngOnInit() {
  }

}
