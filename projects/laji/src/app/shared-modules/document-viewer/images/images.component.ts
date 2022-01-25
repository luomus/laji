import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { QueryParamsHandling } from '@angular/router';

@Component({
  selector: 'laji-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagesComponent implements OnChanges {

  @Input() document: any;
  @Input() highlight: any;
  @Input() eventOnImageClick = false;
  @Input() showViewSwitch = false;
  @Input() showPopover = false;
  @Input() showOverlay = true;
  @Input() showExtraInfo = true;
  @Input() showLinkToSpeciesCard = false;
  @Input() linkOptions: {tab: string, queryParams: any, queryParamsHandling: QueryParamsHandling};
  @Input() sort: string[];
  @Input() shortcut = true;
  @Input() view: 'compact'|'annotation'|'full'|'full2' = 'annotation';
  @Input() views = ['compact', 'full'];

  documentImages;
  gatheringImages;
  unitImages;
  loading: boolean;

  ngOnChanges() {
    this.initImages();
  }

  private initImages() {

  this.documentImages = [];
  this.gatheringImages = [];
  this.unitImages = [];
  this.loading = true;

    if (!this.document) {
      return;
    }
    if (this.document.media) {
      this.documentImages = this.document.media;
    }
    if (this.document.gatherings) {
      for (const gathering of this.document.gatherings) {
        if (gathering.media) {
          this.gatheringImages = this.gatheringImages.concat(gathering.media);
         }
        if (!gathering.units) {
           continue;
        }
        const unit = gathering.units.find(u => u.unitId === this.highlight || (u.media || []).some(media => media.fullURL === this.highlight));
        if (unit) {
          this.gatheringImages = gathering.media || [];
          this.unitImages = unit.media || [];
          break;
        }
      }
    }

    this.loading = false;
  }

}
