import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'll-generic-label-maker',
  template: `
    <div class="maker-container">
    </div>
  `,
  styles: [`
    .maker-container {
      width: 100mm;
      height: 200mm;
      border: 1px solid #000;
    }
  `]
})
export class GenericLabelMakerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
