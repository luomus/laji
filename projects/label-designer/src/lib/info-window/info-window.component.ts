import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InfoWindowService } from './info-window.service';
import { tap } from 'rxjs/operators';
import { IInfoWindow } from '../label-designer.interface';

/**
 * @internal
 */
@Component({
  selector: 'll-info-window',
  templateUrl: './info-window.component.html',
  styleUrls: ['./info-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoWindowComponent implements OnInit {

  visible$: Observable<boolean>;
  data$: Observable<IInfoWindow>;
  isTemplate: boolean;

  constructor(public infoWindowService: InfoWindowService) { }

  ngOnInit() {
    this.data$ = this.infoWindowService.dataAsObservable().pipe(
      tap(data => this.isTemplate = typeof data.content !== 'string')
    );
    this.visible$ = this.infoWindowService.visibilityAsObservable();
  }
}
