import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-facts',
  templateUrl: './facts.component.html',
  styleUrls: ['./facts.component.css']
})
export class FactsComponent implements OnInit {

  @Input() show = false;
  @Input() facts: {fact: string, value: string}[];

  constructor() { }

  ngOnInit() {
  }

}
