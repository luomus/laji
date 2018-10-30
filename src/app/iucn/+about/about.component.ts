import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-about',
  template: `
    <div class="container">
      <laji-info-page [pages]="{'fi': 'r-19', 'en': 'r-21', 'sv': 'r-23'}"></laji-info-page>
    </div>
  `,
  styles: []
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
