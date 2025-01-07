import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IGlobalSite } from '../../../../kerttu-global-shared/models';
import { SiteSelectionMapComponent } from './site-selection-map/site-selection-map.component';

@Component({
  selector: 'bsg-site-selection-view',
  templateUrl: './site-selection-view.component.html',
  styleUrls: ['./site-selection-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteSelectionViewComponent {
  @ViewChild(SiteSelectionMapComponent) siteMap!: SiteSelectionMapComponent;

  @Input() sites: IGlobalSite[] = [];

  selectedSites: number[] = [];
  drawActive = false;
  height = 'calc(100vh - 230px)';

  @Output() siteSelect = new EventEmitter<number[]>();

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

  onConfirm() {
    this.siteSelect.emit(this.selectedSites);
  }
}
