import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { IGlobalSite } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-site-selection-view',
  templateUrl: './site-selection-view.component.html',
  styleUrls: ['./site-selection-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteSelectionViewComponent implements OnInit {
  @Input() sites: IGlobalSite[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
