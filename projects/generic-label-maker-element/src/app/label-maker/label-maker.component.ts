import { Component, Input, OnInit } from '@angular/core';
import { ISetup } from 'generic-label-maker';

@Component({
  selector: 'label-maker',
  templateUrl: './label-maker.component.html',
  styleUrls: ['./label-maker.component.scss']
})
export class LabelMakerComponent implements OnInit {

  @Input()
  setup: ISetup;

  constructor() { }

  ngOnInit() {
  }

}
