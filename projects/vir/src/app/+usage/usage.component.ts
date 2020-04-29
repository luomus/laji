import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'vir-usage',
  template: `
    <div class="container">
      <h1>{{'navigation.usage' | translate}}</h1>
      <p [innerHTML]="'usage.intro' | translate"></p>
      <laji-navigation-thumbnail name="usage.byCollection" icon="species" path="usage/by-collection"></laji-navigation-thumbnail>
      <laji-navigation-thumbnail name="usage.byPerson" icon="numeric" path="usage/by-person"></laji-navigation-thumbnail>
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
