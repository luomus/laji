import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-secure-info',
  templateUrl: './secure-info.component.html',
  styleUrls: ['./secure-info.component.css']
})
export class SecureInfoComponent implements OnInit {

  @Input() secureLevel: string;
  @Input() secureReasons: string[];

  constructor() { }

  ngOnInit() {
  }

}
