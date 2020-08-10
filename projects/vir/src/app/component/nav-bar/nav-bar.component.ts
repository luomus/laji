import { Component, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavbarComponent as LajiNavBarComponent } from '../../../../../../src/app/shared/navbar';
import { NotificationsFacade } from '../../../../../../src/app/shared/navbar/notifications/notifications.facade';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'vir-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: [
    '../../../../../../src/app/shared/navbar/navbar.component.scss',
    './nav-bar.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationsFacade]
})
export class NavBarComponent extends LajiNavBarComponent {
}
