import { Component, OnInit } from '@angular/core';
import { Global } from '../../environments/global';

@Component({
  selector: 'laji-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit {

  Global = Global;

  constructor() { }

  ngOnInit() {
  }

}
