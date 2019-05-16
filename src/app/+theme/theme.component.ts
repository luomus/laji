import { Component, OnInit } from '@angular/core';
import { Global } from '../../environments/global';
import { environment } from '../../environments/environment';

@Component({
  selector: 'laji-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.css']
})
export class ThemeComponent implements OnInit {

  Global = Global;
  environment = environment;

  constructor() { }

  ngOnInit() {
  }

}
