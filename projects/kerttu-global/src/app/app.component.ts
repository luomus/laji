import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderService } from '../../../laji/src/app/shared/service/header.service';
import { HistoryService } from '../../../laji/src/app/shared/service/history.service';

@Component({
  selector: 'bsg-app',
  template: `
    <bsg-navbar></bsg-navbar>
    <div id="content" class="content">
      <div class="router-content">
        <router-outlet></router-outlet>
      </div>
    </div>
    <laji-feedback [iconOnly]="true"></laji-feedback>
  `,
  styleUrls: [
    './app.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    headerService: HeaderService,
    historyService: HistoryService
  ) {
    headerService.initialize();
    historyService.startRouteListener();
  }
}
