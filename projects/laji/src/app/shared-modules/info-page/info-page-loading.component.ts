import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { map, tap } from 'rxjs/operators';
import { InformationItem } from '../../shared/model/InformationItem';
import { MultiLanguage } from '../../shared/model/MultiLanguage';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-info-page-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lu-ghost-paragraph [length]="10"></lu-ghost-paragraph>
    <lu-ghost-paragraph [length]="300"></lu-ghost-paragraph>
    <lu-ghost-paragraph [length]="200"></lu-ghost-paragraph>
`
})
export class InfoPageLoadingComponent {}
