import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-spinner',
  styleUrls: ['./spinner.component.css'],
  template: `
<div class="spinner three-bounce-spinner" 
  *ngIf="spinning" 
  [ngClass]="{'overlay-spinner': overlay, 'inline-spinner': !overlay, 'light': light}">
  <div class="bounce1"></div>
  <div class="bounce2"></div>
  <div class="bounce3"></div>
</div>
<ng-content *ngIf="!hideContentWhileLoading || !spinning"></ng-content>`

})
export class SpinnerComponent implements OnInit {

  @Input() spinning = true;
  @Input() overlay = false;
  @Input() light = false;
  @Input() hideContentWhileLoading = false;

  constructor() {
  }

  ngOnInit() {
  }

}
