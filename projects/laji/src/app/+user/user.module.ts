import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FriendsComponent, ProfileComponent, routing, ProfilePleaseLoginComponent, UserLoginComponent, UserLogoutComponent } from './index';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SharedModule } from '../shared/shared.module';
import { FindPersonModule } from '../shared-modules/find-person/find-person.module';
import { InfoModule } from '../shared-modules/info/info.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { UtilitiesDumbDirectivesModule } from '../shared-modules/utilities/directive/dumb-directives/utilities-dumb-directives.module';

@NgModule({
  imports: [
    routing,
    SharedModule,
    RouterModule,
    TypeaheadModule,
    FindPersonModule,
    InfoModule,
    LajiUiModule,
    UtilitiesDumbDirectivesModule
  ],
  declarations: [ProfilePleaseLoginComponent, ProfileComponent, FriendsComponent, UserLoginComponent, UserLogoutComponent]
})
export class UserModule {
}
