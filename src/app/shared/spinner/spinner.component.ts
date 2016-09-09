import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'laji-spinner',
  template: `<span *ngIf="spinning">...</span><ng-content *ngIf="!spinning"></ng-content>`
})
export class SpinnerComponent implements OnInit {

  @Input() spinning:boolean = true;

  constructor() {
  }

  ngOnInit() {
  }

}
