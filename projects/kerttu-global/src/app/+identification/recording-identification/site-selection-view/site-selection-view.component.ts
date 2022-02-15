import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import { IGlobalSite } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-site-selection-view',
  templateUrl: './site-selection-view.component.html',
  styleUrls: ['./site-selection-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteSelectionViewComponent implements OnInit {
  @Input() sites: IGlobalSite[] = [];

  @Output() siteSelect = new EventEmitter<number[]>();

  constructor() { }

  ngOnInit(): void {
  }

}
