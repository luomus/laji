import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'laji-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagesComponent implements OnChanges {

  @Input() document: any;
  @Input() eventOnImageClick = false;
  @Input() showViewSwitch = false;
  @Input() showPopover = false;
  @Input() showOverlay = true;
  @Input() showExtraInfo = true;
  @Input() showLinkToSpeciesCard = false;
  @Input() linkOptions: {tab: string, queryParams: any, queryParamsHandling: string};
  @Input() sort: string[];
  @Input() view: 'compact'|'annotation'|'full'|'full2' = 'annotation';
  @Input() views = ['compact', 'full'];

  documentImages = [];
  gatheringImages = [];
  unitImages = [];

  ngOnChanges() {
    this.initImages();
  }

  private initImages() {
    if (!this.document) {
      return;
    }
    if (this.document.media) {
      this.documentImages = this.document.media;
    }
    if (this.document.gatherings) {
      this.document.gatherings.map(gathering => {
        if (gathering.media) {
          this.gatheringImages = this.gatheringImages.concat(gathering.media);
        }
        if (gathering.units) {
          gathering.units.map(unit => {
            if (unit.media) {
              this.unitImages = this.unitImages.concat(unit.media);
            }
          });
        }
      });
    }
  }

}
