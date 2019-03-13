import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IInfoWindow, InfoWindowService } from './info-window.service';

@Component({
  selector: 'll-info-window',
  templateUrl: './info-window.component.html',
  styleUrls: ['./info-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoWindowComponent implements OnInit {

  visible$: Observable<boolean>;
  data$: Observable<IInfoWindow>;

  constructor(public infoWindowService: InfoWindowService) { }

  ngOnInit() {
    this.data$ = this.infoWindowService.dataAsObservable();
    this.visible$ = this.infoWindowService.visiblilityAsObservable();
  }
}
