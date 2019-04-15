import { Component, Input, OnInit } from '@angular/core';
import { ISetup } from 'generic-label-maker';

@Component({
  selector: 'label-maker',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss']
})
export class LabelDesignerComponent implements OnInit {

  @Input()
  setup: ISetup;

  constructor() { }

  ngOnInit() {
  }

}
