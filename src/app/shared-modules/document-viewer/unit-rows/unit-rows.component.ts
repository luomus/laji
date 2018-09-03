import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-unit-rows',
  templateUrl: './unit-rows.component.html',
  styleUrls: ['./unit-rows.component.css']
})
export class UnitRowsComponent implements OnInit {
  @Input() unit: any;
  @Input() showFacts = false;
  @Input() showLinks = true;

  constructor() { }

  ngOnInit() {
  }

}
