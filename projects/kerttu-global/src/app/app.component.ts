import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderService } from '../../../laji/src/app/shared/service/header.service';
import { HistoryService } from '../../../laji/src/app/shared/service/history.service';
import { setTheme } from 'ngx-bootstrap/utils';

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
    setTheme('bs3');
    headerService.initialize();
    historyService.startRouteListener();
  }
}
