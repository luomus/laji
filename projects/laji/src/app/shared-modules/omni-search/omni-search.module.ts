import { NgModule } from '@angular/core';
import { OmniSearchComponent } from './omni-search.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [ CommonModule, TranslateModule, SharedModule ],
  declarations: [ OmniSearchComponent ],
  exports: [ OmniSearchComponent ]
})
export class OmniSearchModule {}
