import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent implements OnInit {

  @Input() unit: any;

  constructor() { }

  ngOnInit() {
  }

}
