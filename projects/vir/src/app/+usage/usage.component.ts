import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'vir-usage',
  template: `
    <div class="container">
      <h1>{{'navigation.usage' | translate}}</h1>
      <lu-message class="mb-8" role="contentinfo">
        <div [innerHTML]="'usage.intro' | translate"></div>
      </lu-message>
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
