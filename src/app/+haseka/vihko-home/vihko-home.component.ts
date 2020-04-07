import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { Global } from 'environments/global';

/* tslint:disable:component-selector */
@Component({
  selector: 'vihko-home',
  templateUrl: './vihko-home.component.html',
  styleUrls: ['./vihko-home.component.scss']
})
export class VihkoHomeComponent {
  isDevMode;
  constructor() {
    this.isDevMode = environment.type === Global.type.dev;
  }
}
