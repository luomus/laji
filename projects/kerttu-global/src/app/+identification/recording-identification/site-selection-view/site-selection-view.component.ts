import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IGlobalSite } from '../../../kerttu-global-shared/models';
import { SiteSelectionMapComponent } from './site-selection-map/site-selection-map.component';

@Component({
  selector: 'bsg-site-selection-view',
  templateUrl: './site-selection-view.component.html',
  styleUrls: ['./site-selection-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteSelectionViewComponent {
  @ViewChild(SiteSelectionMapComponent) siteMap: SiteSelectionMapComponent;
  @Input() sites: IGlobalSite[] = [];

  @Output() siteSelect = new EventEmitter<number[]>();

  selectedSites = [];
  drawActive = false;

  selectByDrawingClick() {
    this.drawActive = !this.drawActive;
    if (this.drawActive) {
      this.siteMap.drawToMap('Rectangle');
    } else {
      this.siteMap.abortDrawing();
    }
  }

  onSelectedSitesChange() {
    if (this.drawActive) {
      this.selectByDrawingClick();
    }
  }
}
