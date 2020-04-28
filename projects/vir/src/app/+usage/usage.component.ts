import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'vir-usage',
  template: `
    <p>
      usage placeholder!
    </p>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
