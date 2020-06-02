import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'vir-usage',
  template: `
    <div class="container-fluid mt-6">
      <laji-navigation-thumbnail name="usage.byCollection" icon="chart" path="usage/by-collection"></laji-navigation-thumbnail>
      <laji-navigation-thumbnail name="usage.byPerson" icon="person" path="usage/by-person"></laji-navigation-thumbnail>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
