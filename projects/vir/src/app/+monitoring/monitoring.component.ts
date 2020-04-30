import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'vir-monitoring',
  template: `
    <p>
      monitoring placeholder!
    </p>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
