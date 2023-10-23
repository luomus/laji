import { NgModule } from '@angular/core';
import { NotificationComponent } from './notification/notification.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { TaxonDropdownComponent } from './taxon-dropdown/taxon-dropdown.component';
import { NavbarComponent } from './navbar.component';
import { OmniSearchModule } from '../omni-search/omni-search.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [ CommonModule, OmniSearchModule, TranslateModule, ScrollingModule, LajiUiModule, SharedModule ],
  declarations: [ NotificationComponent, NotificationsComponent, TaxonDropdownComponent, NavbarComponent ],
  exports: [ NavbarComponent ]
})
export class NavbarModule {}
