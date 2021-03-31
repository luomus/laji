import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'vir-usage',
  template: `
    <div class="container-fluid mt-6">
      <laji-navigation-thumbnail name="usage.byCollection" icon="chart" path="usage/downloads"></laji-navigation-thumbnail>
      <laji-navigation-thumbnail name="usage.byUser" icon="person" path="usage/my-downloads"></laji-navigation-thumbnail>
      <laji-navigation-thumbnail name="usage.byOrganization" icon="person" path="usage/by-organization"></laji-navigation-thumbnail>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageComponent {

}
