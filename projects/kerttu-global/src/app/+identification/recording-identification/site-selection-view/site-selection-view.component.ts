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

  selectedSiteIds: number[] = [];
  selectedSites: IGlobalSite[] = [];
  drawActive = false;

  height = 'calc(100vh - 230px)';

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

    this.selectedSites = this.sites.filter(s => this.selectedSiteIds.includes(s.id));
  }

  onConfirm() {
    this.siteSelect.emit(this.selectedSiteIds);
  }
}
